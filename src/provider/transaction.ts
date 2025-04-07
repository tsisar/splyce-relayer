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

const COMPUTE_UNIT_FOR_BUDGET = 400;

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
    // const computedFeeLamports = (priorityFee * requiredUnits) / 1e6;
    // const totalFeeLamports = computedFeeLamports + TRANSACTION_FEE;
    //
    // if (userFee !== 0 && userFee < totalFeeLamports) {
    //     console.error(`User fee (${userFee} lamports) is less than the required total priority fee (${totalFeeLamports} lamports). Transaction failed.`);
    //     throw new Error("User fee is less than the total required priority fee.");
    // }

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
        console.error("Transaction simulation error:", simulationResult.value.err);
        let fullMessage: string = "Transaction simulation failed.";
        const logs: string[] = simulationResult.value.logs ?? [];

        logs.forEach((log: string, idx: number) => {
            console.error(`Simulation Log ${idx + 1}: ${log}`);
        });

        try {
            const anchorError = AnchorError.parse(logs);
            if (anchorError && anchorError.error && anchorError.error.errorMessage) {
                fullMessage = anchorError.error.errorMessage;
                console.error("Parsed Anchor error message (simulation):", fullMessage);
            }
        } catch (parseError) {
            console.error("Could not parse simulation error", parseError);
        }

        const logsText = logs.join("\n");
        const regex = /Error Code:\s*([^.]+)\.\s*Error Number:\s*(\d+)\.\s*Error Message:\s*([^.\n]+)(?:\.|$)/i;
        const match = logsText.match(regex);
        let shortMessage = fullMessage;
        if (match) {
            shortMessage = `Error Code: ${match[1].trim()}. Error Number: ${match[2].trim()}. Error Message: ${match[3].trim()}.`;
        }
        console.error("Simulation error short message:", shortMessage);
        throw new Error(shortMessage);
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendTransaction(
    provider: AnchorProvider,
    instructions: TransactionInstruction[],
    bot: Keypair,
    lutAccounts: AddressLookupTableAccount[] = [],
): Promise<string> {
    const retries = TRANSACTION_MAX_RETRIES;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Create signed versioned transaction
            const versionedTx = await createSignedVersionedTransaction(provider, instructions, bot, lutAccounts);

            // Get Helius priority fee
            let priorityFee = await getPriorityFee(versionedTx);
            console.log("Priority Fee from Helius:", priorityFee);

            if (priorityFee === null || priorityFee === undefined || priorityFee < DEFAULT_COMPUTE_UNIT_PRICE) {
                priorityFee = DEFAULT_COMPUTE_UNIT_PRICE;
                console.log(`Using default compute unit price: ${priorityFee}`);
            } else if (priorityFee > MAX_COMPUTE_UNIT_PRICE) {
                priorityFee = MAX_COMPUTE_UNIT_PRICE;
                console.log(`Using max compute unit price: ${priorityFee}`);
            }

            // Get required compute units
            const units = await getSimulationComputeUnits(provider.connection, [... instructions], bot.publicKey, lutAccounts);

            let requiredUnits = units ?? COMPUTE_UNIT_LIMIT;
            let buffer = requiredUnits * COMPUTE_UNIT_BUFFER;
            requiredUnits = Math.trunc(requiredUnits + buffer + COMPUTE_UNIT_FOR_BUDGET); // Add buffer to the computed units
            console.log("Required units:", requiredUnits);

            // Get compute budget instructions
            const computeBudgetInstructions = await getComputeBudgetInstructions(priorityFee, requiredUnits);

            // Combine compute budget instructions with the original instructions
            const finalInstructions = [...computeBudgetInstructions, ...instructions];

            // Create signed versioned transaction with compute budget instructions
            const finalVersionedTx = await createSignedVersionedTransaction(provider, finalInstructions, bot, lutAccounts);

            // Simulate transaction
            if (SIMULATE_TRANSACTION){
                await simulateTransaction(provider, finalVersionedTx);
            }

            // Send and confirm transaction
            const signature = await provider.sendAndConfirm(finalVersionedTx);
            console.log("Transaction confirmed:", signature);

            // Get transaction meta (fee and compute units)
            const transactionMeta = await getTransactionMeta(provider, signature);
            if (transactionMeta !== null) {
                console.log(`Fee: ${transactionMeta.fee} SOL, Units consumed: ${transactionMeta.units}`);
            } else {
                console.log(`Transaction details not found, signature: ${signature}`);
            }

            return signature;
        } catch (err: any) {
            if (err instanceof TransactionExpiredTimeoutError) {
                console.warn(
                    `Transaction attempt ${attempt} failed with TransactionExpiredTimeoutError. Checking status...`
                );

                const txStatus = await provider.connection.getSignatureStatus(err.signature);

                if (txStatus?.value?.confirmationStatus === "confirmed") {
                    console.log("Transaction was actually confirmed:", err.signature);
                    return err.signature;
                } else if (attempt === retries) {
                    console.error("Max retries reached. Transaction failed.");
                    throw new Error("Transaction failed after maximum retries.");
                }

                console.log(`Retrying transaction... Attempt ${attempt + 1}/${retries}`);
                await delay(TRANSACTION_RETRY_INTERVAL);
            } else {
                console.error(`Transaction attempt ${attempt} failed:`, err);
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
            console.log('Transaction details not found or meta not available');
            return null;
        }
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        throw error;
    }
}