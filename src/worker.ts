import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {PRIVATE_KEY} from "./config/config";
import {Manager} from "./provider/manager"
import {
    getIsTransferCompletedSolana,
    parseTransferPayload,
    parseVaa
} from "@certusone/wormhole-sdk";
import {
    postVaaSolanaWithRetry,
    NodeWallet,
} from "@certusone/wormhole-sdk/lib/cjs/solana";
import {hexToSolanaBase58} from "./utils";
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

const TAG = "Worker";

const ACCOUNTANT_ID = new PublicKey("EqMiuTEZuZLUWfZXLbPaT54Snqcq3asoecMdtny7rJC7");
const TOKEN_BRIDGE_PID = "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe"
const TOKEN_BRIDGE_PROGRAM_ID = new PublicKey(TOKEN_BRIDGE_PID);
const CORE_BRIDGE_PID = "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"

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

    const transferPayload = payload.subarray(133); // відрізаємо заголовок
    return transferPayload.toString("hex");
}

function decodeTokenTransferPayload(payloadHex: string) {
    if (payloadHex.length <= 128) {
        throw new Error("Payload too short. Expected more than 64 bytes (128 hex chars).");
    }

    const addressPart = payloadHex.slice(-128);
    const chainIdHex = payloadHex.slice(0, payloadHex.length - 128);
    const chainId = parseInt(chainIdHex, 16);

    const payload = Buffer.from(addressPart, "hex");

    const sharesRecipientHex = payload.subarray(0, 32).toString("hex");
    const vaultAddressHex = payload.subarray(32, 64).toString("hex");

    return {
        chainId,
        sharesRecipientAddress: sharesRecipientHex,
        vaultAddress: vaultAddressHex,
    };
}

async function postVaaOnSolana(
    connection: Connection,
    payer: Keypair,
    coreBridge: PublicKey,
    signedMsg: Buffer
) {
    const wallet = NodeWallet.fromSecretKey(payer.secretKey);

    const txResults = await postVaaSolanaWithRetry(
        connection,
        wallet.signTransaction,
        coreBridge,
        wallet.key(),
        signedMsg
    );

    log.debug(TAG, "Posted VAA tx:", txResults.map(r => r.signature).join(", "));
}

async function relay(manager: Manager, payer: Keypair, vaa: string) {
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
        new PublicKey(TOKEN_BRIDGE_PID),
        signedVaa,
        connection
    );
    if (isRedeemed) {
        log.debug(TAG, "VAA has already been redeemed");
        return;
    }
    log.debug(TAG, "VAA has not been redeemed yet");

    // Parse the VAA.
    const parsedVaa = parseVaa(signedVaa);

    // Make sure it's a payload 3.
    const payloadType = parsedVaa.payload.readUint8(0);
    if (payloadType != 3) {
        log.debug(TAG, "Not a payload 3");
        return;
    }
    log.debug(TAG, "Parsed VAA:", parsedVaa);

    const vaaHashBuffer = parsedVaa.hash;
    const vaaHashBytes = Array.from(parsedVaa.hash);

    // Parse the payload.
    const transferPayload = parseTransferPayload(parsedVaa.payload);

    const PROGRAM_ID_HEX = Buffer.from(wormholeProgram.programId.toBytes()).toString("hex");
    // Confirm that the destination is the relayer contract.
    if (transferPayload.targetAddress != PROGRAM_ID_HEX) {
        log.debug(TAG, "Destination is not the relayer contract");
        return;
    }

    log.debug(TAG, "PROGRAM_ID_HEX:", PROGRAM_ID_HEX);
    log.debug(TAG, "Transfer payload:", transferPayload);

    // Post the VAA on chain.
    try {
        await postVaaOnSolana(
            connection,
            payer,
            new PublicKey(CORE_BRIDGE_PID),
            signedVaa
        );
    } catch (e) {
        log.error(TAG, e);
        process.exit(1);
    }

    const tokenTransferPayload = extractRawTokenTransferPayload(vaa);
    log.debug(TAG, "Payload:", tokenTransferPayload);

    const {chainId, sharesRecipientAddress, vaultAddress} = decodeTokenTransferPayload(tokenTransferPayload);
    log.debug(TAG, "Decoded payload chainId:", chainId);

    const recipient = new PublicKey(hexToSolanaBase58(sharesRecipientAddress));
    log.debug(TAG, "Decoded payload sharesRecipientAddress:", recipient.toBase58());

    const vault = new PublicKey(hexToSolanaBase58(vaultAddress));
    log.debug(TAG, "Decoded payload vaultAddress:", vault.toBase58());

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

    const tokenBridgeWrappedMint = deriveWrappedMintKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        transferPayload.originChain,
        Buffer.from(transferPayload.originAddress, "hex")
    );
    log.debug(TAG, `tokenBridgeWrappedMint expected: ${tokenBridgeWrappedMint.toBase58()}`);

    const [depositPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("received"),
            vaaHashBuffer
        ],
        wormholeProgram.programId
    );
    log.debug(TAG, `depositPDA expected: ${depositPDA.toBase58()}`);

    try {
        const tx1 = await wormholeProgram.methods
            .receive(vaaHashBytes)
            .accounts({
                payer: payer.publicKey,
                tokenBridgeClaim: tokenBridgeClaim,
                tokenBridgeConfig: tokenBridgeConfig,
                tokenBridgeForeignEndpoint: tokenBridgeForeignEndpoint,
                tokenBridgeMintAuthority: tokenBridgeMintAuthority,
                tokenBridgeWrappedMint: tokenBridgeWrappedMint,
            })
            .signers([payer])
            .rpc();

        log.debug(TAG, "Receive tx1:", tx1);
    } catch (error) {
        log.error(TAG, "Unexpected error in receive:", error);
        process.exit(1);
    }

    try {
        const tx2 = await wormholeProgram.methods
            .executeDeposit()
            .accounts({
                deposit: depositPDA,
                recipient,
                vault,
                accountant: ACCOUNTANT_ID,
                underlyingMint: tokenBridgeWrappedMint,
            })
            .signers([payer])
            .rpc();

        log.debug(TAG, "ExecuteDeposit tx2:", tx2);
    } catch (error) {
        log.error(TAG, "Unexpected error in executeDeposit:", error);
        process.exit(1);
    }
}

function getBotKeypair(): Keypair {
    let privateKeyArray: number[] = [];

    if (PRIVATE_KEY) {
        try {
            privateKeyArray = JSON.parse(PRIVATE_KEY);
        } catch (error) {
            console.error("Error parsing PRIVATE_KEY:", error);
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

async function main() {
    const vaa = "AQAAAAABAK506gdY40UmOW3FORVAl5yr4c434TRdf9ITE8nKcPhHAeHIYzEzyEK4dTOGfjsGj+bwKvxGBPeHEapmSPUfkvkAZ+1HMAAAAAAnEgAAAAAAAAAAAAAAANtUkiZfYDiDHon0lWcP+Qmt6UvZAAAAAAAAEgMBAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYagAAAAAAAAAAAAAAAAHH1LGWywx7AddD+8YRapAjeccjgnEnXAn45cglOAqDVoBIbgGnZ+4+0tD6SHqgTkTo38ySojAAEAAAAAAAAAAAAAAADvtkQVkNqb+N1bKvFA5LH0j6fsDAHfAg8xynlUN7+nNlSUp4oN5SUJgHH9VUQPmhoGPxA1rdiu9jRatWfUj6hPw1Hhsmz/NXeoz0Zj0pHwZHgVBLSf";

    const payer = getBotKeypair()

    // Set up the manager.
    const manager = new Manager(payer);

    // Relay VAA.
    await relay(manager, payer, vaa);
}

export async function processVAA(vaa: string) {
    const payer = getBotKeypair()

    // Set up the manager.
    const manager = new Manager(payer);

    // Relay VAA.
    await relay(manager, payer, vaa);
}

main();