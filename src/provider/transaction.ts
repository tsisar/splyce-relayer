import {
    AddressLookupTableAccount,
    ComputeBudgetProgram,
    Keypair,
    TransactionExpiredTimeoutError,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import {AnchorError, AnchorProvider} from "@coral-xyz/anchor";
import {getPriorityFee} from "./helius";
import {
    COMPUTE_UNIT_BUFFER,
    COMPUTE_UNIT_LIMIT,
    DEFAULT_COMPUTE_UNIT_PRICE,
    MAX_COMPUTE_UNIT_PRICE,
    SIMULATE_TRANSACTION,
    TRANSACTION_MAX_RETRIES,
    TRANSACTION_RETRY_INTERVAL
} from "../config/config";
import {getSimulationComputeUnits} from "@solana-developers/helpers";
import {log} from "../logger/logger";

const COMPUTE_UNIT_FOR_BUDGET = 400;
const TAG = "Transaction";

async function createSignedVersionedTransaction(
    provider: AnchorProvider,
    instructions: TransactionInstruction[],
    bot: Keypair,
    addressLookupTableAccounts: AddressLookupTableAccount[] = [],
): Promise<VersionedTransaction> {
    const latestBlockhash = await provider.connection.getLatestBlockhash();

    // Compile the transaction message with the lookup table accounts.
    const messageV0 = new TransactionMessage({
        payerKey: bot.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: instructions,
    }).compileToV0Message(addressLookupTableAccounts);

    const versionedTx = new VersionedTransaction(messageV0);
    versionedTx.sign([bot]);

    return versionedTx;
}

async function getComputeBudgetInstructions(
    priorityFee: number,
    requiredUnits: number
): Promise<TransactionInstruction[]> {
    return [
        ComputeBudgetProgram.setComputeUnitLimit({ units: requiredUnits }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }),
    ];
}

async function simulateTransaction(provider: AnchorProvider, versionedTx: VersionedTransaction): Promise<void> {
    const simulationResult = await provider.connection.simulateTransaction(
        versionedTx,
        { commitment: "processed" }
    );

    if (simulationResult.value.err) {
        log.error(TAG, "Transaction simulation error:", simulationResult.value.err);
        let fullMessage: string = "Transaction simulation failed.";
        const logs: string[] = simulationResult.value.logs ?? [];

        logs.forEach((log: string, idx: number) => {
            console.error(`Simulation Log ${idx + 1}: ${log}`);
        });

        try {
            const anchorError = AnchorError.parse(logs);
            if (anchorError && anchorError.error && anchorError.error.errorMessage) {
                fullMessage = anchorError.error.errorMessage;
                log.error(TAG, "Parsed Anchor error message (simulation):", fullMessage);
            }
        } catch (parseError) {
            log.error(TAG, "Could not parse simulation error", parseError);
        }

        const logsText = logs.join("\n");
        const regex = /Error Code:\s*([^.]+)\.\s*Error Number:\s*(\d+)\.\s*Error Message:\s*([^.\n]+)(?:\.|$)/i;
        const match = logsText.match(regex);
        let shortMessage = fullMessage;
        if (match) {
            shortMessage = `Error Code: ${match[1].trim()}. Error Number: ${match[2].trim()}. Error Message: ${match[3].trim()}.`;
        }
        log.error(TAG, "Simulation error short message:", shortMessage);
        throw new Error(shortMessage);
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolvePriorityFee(versionedTx: VersionedTransaction): Promise<number> {
    let priorityFee = await getPriorityFee(versionedTx);
    log.debug(TAG, "Priority Fee from Helius:", priorityFee);

    if (!priorityFee || priorityFee < DEFAULT_COMPUTE_UNIT_PRICE) {
        priorityFee = DEFAULT_COMPUTE_UNIT_PRICE;
        log.debug(TAG, `Using default compute unit price: ${priorityFee}`);
    } else if (priorityFee > MAX_COMPUTE_UNIT_PRICE) {
        priorityFee = MAX_COMPUTE_UNIT_PRICE;
        log.debug(TAG, `Using max compute unit price: ${priorityFee}`);
    }

    return priorityFee;
}

async function resolveComputeUnits(
    provider: AnchorProvider,
    instructions: TransactionInstruction[],
    bot: Keypair,
    lutAccounts: AddressLookupTableAccount[]
): Promise<number> {
    let estimatedUnits = null

    if (SIMULATE_TRANSACTION) {
        estimatedUnits = await getSimulationComputeUnits(
            provider.connection,
            instructions,
            bot.publicKey,
            lutAccounts
        );
    }

    let requiredUnits = estimatedUnits ?? COMPUTE_UNIT_LIMIT;
    const buffer = requiredUnits * COMPUTE_UNIT_BUFFER;
    requiredUnits = Math.trunc(requiredUnits + buffer + COMPUTE_UNIT_FOR_BUDGET);

    log.debug(TAG, "Required units:", requiredUnits);
    return requiredUnits;
}

export async function sendTransaction(
    provider: AnchorProvider,
    instructions: TransactionInstruction[],
    bot: Keypair,
    lutAccounts: AddressLookupTableAccount[] = [],
): Promise<string> {
    for (let attempt = 1; attempt <= TRANSACTION_MAX_RETRIES; attempt++) {
        try {
            const versionedTx = await createSignedVersionedTransaction(provider, instructions, bot, lutAccounts);
            const priorityFee = await resolvePriorityFee(versionedTx);
            const requiredUnits = await resolveComputeUnits(provider, instructions, bot, lutAccounts);
            const computeBudgetInstructions = await getComputeBudgetInstructions(priorityFee, requiredUnits);

            const finalInstructions = [...computeBudgetInstructions, ...instructions];
            const finalVersionedTx = await createSignedVersionedTransaction(provider, finalInstructions, bot, lutAccounts);

            if (SIMULATE_TRANSACTION) {
                await simulateTransaction(provider, finalVersionedTx);
            }

            const signature = await provider.sendAndConfirm(finalVersionedTx);
            log.debug(TAG, "Transaction confirmed:", signature);

            const transactionMeta = await getTransactionMeta(provider, signature);
            if (transactionMeta) {
                log.debug(TAG, `Fee: ${transactionMeta.fee} SOL, Units consumed: ${transactionMeta.units}`);
            }

            return signature;
        } catch (err: any) {
            if (err instanceof TransactionExpiredTimeoutError) {
                log.debug(TAG, `Transaction signature: ${err.signature}`);
                const status = await provider.connection.getSignatureStatus(err.signature);
                if (status?.value?.confirmationStatus === "confirmed") {
                    log.debug(TAG, "Transaction actually confirmed:", err.signature);
                    return err.signature;
                }
                if (attempt === TRANSACTION_MAX_RETRIES) {
                    log.error(TAG, "Max retries reached. Transaction failed.");
                    throw new Error("Transaction failed after maximum retries.");
                }
                log.debug(TAG, `Retrying transaction... Attempt ${attempt + 1}`);
                await delay(TRANSACTION_RETRY_INTERVAL);
            } else {
                log.error(TAG, `Transaction attempt ${attempt} failed:`, err);
                throw new Error(err.message || err.toString());
            }
        }
    }
    throw new Error("Transaction failed after maximum retries.");
}

async function getTransactionMeta(provider: AnchorProvider, transactionHash: string): Promise<{ fee: number; units: number | null } | null> {
    try {
        const transactionDetails = await provider.connection.getTransaction(transactionHash, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });

        if (transactionDetails && transactionDetails.meta) {
            const feeInLamports = transactionDetails.meta.fee;
            const units = transactionDetails.meta.computeUnitsConsumed ?? null;
            return { fee: feeInLamports / 1e9, units };
        } else {
            log.debug(TAG, 'Transaction details not found or meta not available');
            return null;
        }
    } catch (error) {
        log.error(TAG, 'Error fetching transaction details:', error);
        throw error;
    }
}