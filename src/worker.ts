import {Connection, Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {ACCOUNTANT, PRIVATE_KEY} from "./config/config";
import {Manager} from "./provider/manager"
import {
    getIsTransferCompletedSolana, ParsedVaa,
    parseTransferPayload,
    parseVaa,
} from "@certusone/wormhole-sdk";
import {
    postVaaSolanaWithRetry,
    NodeWallet,
} from "@certusone/wormhole-sdk/lib/cjs/solana";
import {log} from "./logger/logger";
import {Buffer} from "buffer";

import {
    deriveClaimKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";

import {
    deriveEndpointKey,
    deriveMintAuthorityKey,
    deriveTokenBridgeConfigKey,
    deriveWrappedMintKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import {ChainId} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import {tryHexToNativeString} from "@certusone/wormhole-sdk/lib/cjs/utils/array";
import {sendTransaction} from "./provider/transaction";
import {WormholeRelayer} from "../types/wormhole_relayer";
import {Program} from "@coral-xyz/anchor";
import {SOLANA_CORE_BRIDGE, SOLANA_TOKEN_BRIDGE} from "./config/constants";
import AsyncLock from "async-lock";
import {saveTxHash, updateVaaStatus} from "./pg-storage/vaa";

export const lock = new AsyncLock();

const TAG = "Worker";

const ACCOUNTANT_PROGRAM_ID = new PublicKey(ACCOUNTANT);
const TOKEN_BRIDGE_PROGRAM_ID = new PublicKey(SOLANA_TOKEN_BRIDGE);
const CORE_BRIDGE_PROGRAM_ID = new PublicKey(SOLANA_CORE_BRIDGE);

export function extractRawTokenTransferPayload(base64Vaa: string): string {
    const vaaBuffer = Buffer.from(base64Vaa, "base64");

    const parsed = parseVaa(vaaBuffer);

    const payload = parsed.payload;

    const payloadType = payload.readUInt8(0);
    if (payloadType !== 3) {
        throw new Error(`Not a TransferWithPayload. Found payload type: ${payloadType}`);
    }

    // Payload structure:
    // 1 byte  - payload type
    // 32 bytes - amount
    // 32 bytes - origin address
    // 2 bytes  - origin chain
    // 32 bytes - target address
    // 2 bytes  - target chain
    // 32 bytes - from address
    // = 133 bytes header

    const transferPayload = payload.subarray(133);
    return transferPayload.toString("hex");
}

function decodeTokenTransferPayload(payloadHex: string) {
    const payload = Buffer.from(payloadHex, "hex");

    if (payload.length < 1 + 32 + 32) {
        throw new Error("Payload too short. Expected at least 65 bytes.");
    }

    const payloadId = payload.readUInt8(0); // 1 byte
    const sharesRecipientHex = payload.subarray(1, 33).toString("hex");
    const vaultAddressHex = payload.subarray(33, 65).toString("hex");

    return {
        payloadId,
        sharesRecipientAddress: sharesRecipientHex,
        vaultAddress: vaultAddressHex,
    };
}

async function postVaaOnSolana(
    connection: Connection,
    payer: Keypair,
    coreBridge: PublicKey,
    signedMsg: Buffer
): Promise<string[]> {
    log.debug(TAG, "Post Vaa On Solana...");

    const wallet = NodeWallet.fromSecretKey(payer.secretKey);

    const txResults = await postVaaSolanaWithRetry(
        connection,
        wallet.signTransaction,
        coreBridge,
        wallet.key(),
        signedMsg
    );

    return txResults.map((r) => r.signature);
}

async function buildReceiveInstruction(
    wormholeProgram: Program<WormholeRelayer>,
    payer: Keypair,
    parsedVaa: ParsedVaa,
    tokenBridgeWrappedMint:
    PublicKey
): Promise<TransactionInstruction> {
    log.debug(TAG, "Build Receive Instruction...");

    const tokenBridgeClaim = deriveClaimKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        parsedVaa.emitterAddress,
        parsedVaa.emitterChain,
        parsedVaa.sequence
    );
    log.debug(TAG, `tokenBridgeClaim expected: ${tokenBridgeClaim.toBase58()}`);

    const tokenBridgeConfig = deriveTokenBridgeConfigKey(TOKEN_BRIDGE_PROGRAM_ID);
    log.debug(TAG, `tokenBridgeConfig expected: ${tokenBridgeConfig.toBase58()}`);

    const tokenBridgeForeignEndpoint = deriveEndpointKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        parsedVaa.emitterChain,
        parsedVaa.emitterAddress
    );
    log.debug(TAG, `tokenBridgeForeignEndpoint expected: ${tokenBridgeForeignEndpoint.toBase58()}`);

    const tokenBridgeMintAuthority = deriveMintAuthorityKey(TOKEN_BRIDGE_PROGRAM_ID);
    log.debug(TAG, `tokenBridgeMintAuthority expected: ${tokenBridgeMintAuthority.toBase58()}`);

    return await wormholeProgram.methods
        .receive(Array.from(parsedVaa.hash))
        .accounts({
            payer: payer.publicKey,
            tokenBridgeClaim: tokenBridgeClaim,
            tokenBridgeConfig: tokenBridgeConfig,
            tokenBridgeForeignEndpoint: tokenBridgeForeignEndpoint,
            tokenBridgeMintAuthority: tokenBridgeMintAuthority,
            tokenBridgeWrappedMint: tokenBridgeWrappedMint,
        })
        .instruction();
}

async function buildExecuteDepositInstruction(
    wormholeProgram: Program<WormholeRelayer>,
    parsedVaa: ParsedVaa,
    tokenBridgeWrappedMint: PublicKey,
    recipient: PublicKey,
    vault: PublicKey
): Promise<TransactionInstruction> {
    log.debug(TAG, "Build ExecuteDeposit Instruction...");

    const [depositPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("received"),
            parsedVaa.hash
        ],
        wormholeProgram.programId
    );
    log.debug(TAG, `depositPDA expected: ${depositPDA.toBase58()}`);

    return await wormholeProgram.methods
        .executeDeposit()
        .accounts({
            deposit: depositPDA,
            recipient,
            vault,
            accountant: ACCOUNTANT_PROGRAM_ID,
            underlyingMint: tokenBridgeWrappedMint,
        })
        .instruction();
}

async function relay(manager: Manager, payer: Keypair, vaa: string, force: boolean = false) {
    // Set up provider.
    const provider = await manager.getProvider();
    // Get the connection.
    const connection = provider.connection
    // Wormhole program
    const wormholeProgram = await manager.getProgram();
    // Get signed VAA.
    const signedVaa = Buffer.from(vaa, "base64")

    // Check to see if the VAA has been redeemed already.
    const isRedeemed = await getIsTransferCompletedSolana(
        new PublicKey(SOLANA_TOKEN_BRIDGE),
        signedVaa,
        connection
    );
    if (isRedeemed) {
        log.debug(TAG, "VAA has already been redeemed");
        if (!force) {
            return;
        }
    } else {
        log.debug(TAG, "VAA has not been redeemed yet");
    }

    // Parse the VAA.
    const parsedVaa = parseVaa(signedVaa);
    // log.debug(TAG, "Parsed VAA:", parsedVaa);

    // Make sure it's a payload 3.
    const payloadType = parsedVaa.payload.readUint8(0);
    if (!force && payloadType != 3) {
        log.debug(TAG, "Not a payload 3");
        return;
    }

    // Parse the payload.
    const transferPayload = parseTransferPayload(parsedVaa.payload);
    // log.debug(TAG, "Transfer payload:", transferPayload);

    const targetChain = transferPayload.targetChain as ChainId;
    log.debug(TAG, "Target chain:", targetChain);

    const targetAddress = tryHexToNativeString(transferPayload.targetAddress, targetChain);
    log.debug(TAG, "Target address:", targetAddress);

    // Post the VAA on chain.
    try {
        const signatures = await postVaaOnSolana(connection, payer, CORE_BRIDGE_PROGRAM_ID, signedVaa);

        for (const sig of signatures) {
            log.info(TAG, "Signature:", sig);
            await saveTxHash(
                parsedVaa.emitterChain,
                parsedVaa.emitterAddress.toString("hex"),
                parsedVaa.sequence.toString(),
                sig
            );
        }
    } catch (e) {
        throw new Error(`postVaaOnSolana failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    const tokenBridgeWrappedMint = deriveWrappedMintKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        transferPayload.originChain,
        Buffer.from(transferPayload.originAddress, "hex")
    );
    log.debug(TAG, `tokenBridgeWrappedMint expected: ${tokenBridgeWrappedMint.toBase58()}`);

    const tokenTransferPayload = extractRawTokenTransferPayload(vaa);
    log.debug(TAG, "Payload:", tokenTransferPayload);

    const {payloadId, sharesRecipientAddress, vaultAddress} = decodeTokenTransferPayload(tokenTransferPayload);
    log.debug(TAG, "Decoded payload Id:", payloadId);

    const recipient = new PublicKey(tryHexToNativeString(sharesRecipientAddress, targetChain));
    log.debug(TAG, "Decoded payload sharesRecipientAddress:", recipient.toBase58());

    const vault = new PublicKey(tryHexToNativeString(vaultAddress, targetChain));
    log.debug(TAG, "Decoded payload vaultAddress:", vault.toBase58());

    try {
        const instruction1 = await buildReceiveInstruction(wormholeProgram, payer, parsedVaa, tokenBridgeWrappedMint);
        log.info(TAG, "Sending transaction...");
        const signature = await sendTransaction(provider, [instruction1], payer);
        log.info(TAG, "Signature:", signature);
        await saveTxHash(
            parsedVaa.emitterChain,
            parsedVaa.emitterAddress.toString("hex"),
            parsedVaa.sequence.toString(),
            signature
        );
    } catch (error) {
        throw new Error(`ExecuteReceive failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
        const instruction2 = await buildExecuteDepositInstruction(wormholeProgram, parsedVaa, tokenBridgeWrappedMint, recipient, vault);
        log.info(TAG, "Sending transaction...");
        const signature = await sendTransaction(provider, [instruction2], payer);
        log.info(TAG, "Signature:", signature);
        await saveTxHash(
            parsedVaa.emitterChain,
            parsedVaa.emitterAddress.toString("hex"),
            parsedVaa.sequence.toString(),
            signature
        );
    } catch (error) {
        throw new Error(`ExecuteDeposit failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function getBotKeypair(): Keypair {
    let privateKeyArray: number[] = [];

    if (PRIVATE_KEY) {
        try {
            privateKeyArray = JSON.parse(PRIVATE_KEY);
        } catch (error) {
            log.error(TAG, "Error parsing PRIVATE_KEY:", error);
            throw new Error("Invalid PRIVATE_KEY format. It should be a JSON array of numbers.");
        }
    } else {
        throw new Error("PRIVATE_KEY is not set in the environment variables.");
    }

    if (!Array.isArray(privateKeyArray)) {
        throw new Error("PRIVATE_KEY is not a valid array");
    }

    if (privateKeyArray.length !== 64) {
        throw new Error("Invalid PRIVATE_KEY length. Expected 64 bytes.");
    }

    return Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
}


export async function processVaa(emitterChain: number, emitterAddress: string, sequence: string, vaa: string, force: boolean = false): Promise<void> {
    const payer = getBotKeypair();
    const manager = new Manager(payer);

    await lock.acquire("signing-lock", async () => {
        try {
            await relay(manager, payer, vaa, force);
            await updateVaaStatus(emitterChain, emitterAddress, sequence, "completed");
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            await updateVaaStatus(emitterChain, emitterAddress, sequence, "failed");
            throw new Error(`VAA processing failed: ${message}`);
        }
    });
}