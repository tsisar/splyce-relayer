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

const mockRedisValue = {
    vaa: "AQAAAAABAK506gdY40UmOW3FORVAl5yr4c434TRdf9ITE8nKcPhHAeHIYzEzyEK4dTOGfjsGj+bwKvxGBPeHEapmSPUfkvkAZ+1HMAAAAAAnEgAAAAAAAAAAAAAAANtUkiZfYDiDHon0lWcP+Qmt6UvZAAAAAAAAEgMBAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYagAAAAAAAAAAAAAAAAHH1LGWywx7AddD+8YRapAjeccjgnEnXAn45cglOAqDVoBIbgGnZ+4+0tD6SHqgTkTo38ySojAAEAAAAAAAAAAAAAAADvtkQVkNqb+N1bKvFA5LH0j6fsDAHfAg8xynlUN7+nNlSUp4oN5SUJgHH9VUQPmhoGPxA1rdiu9jRatWfUj6hPw1Hhsmz/NXeoz0Zj0pHwZHgVBLSf",
    payload: "df020f31ca795437bfa7365494a78a0de525098071fd55440f9a1a063f1035add8aef6345ab567d48fa84fc351e1b26cff3577a8cf4663d291f064781504b49f"
};

const TOKEN_BRIDGE_PID = "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe"
const TOKEN_BRIDGE_PROGRAM_ID = new PublicKey(TOKEN_BRIDGE_PID);
const CORE_BRIDGE_PID = "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"

function decodeVaultPayload(payloadHex: string) {
    const payload = Buffer.from(payloadHex, "hex");

    if (payload.length !== 64) {
        throw new Error("Expected 64 bytes (2x Solana addresses)");
    }

    const sharesRecipient = payload.subarray(0, 32).toString("hex");
    const vaultAddress = payload.subarray(32, 64).toString("hex");

    return {
        sharesRecipient,
        vaultAddress,
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

async function receive(manager: Manager, payer: Keypair, vaa: string) {

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

    const {sharesRecipient, vaultAddress} = decodeVaultPayload(mockRedisValue.payload);
    log.debug(TAG, "Shares Recipient:", sharesRecipient );

    const recipient = new PublicKey(hexToSolanaBase58(sharesRecipient));
    log.debug(TAG, "Recipient:", recipient);
    log.debug(TAG, "Shares Recipient: G1XjoJpF6NvfSsbkreefjQgTf4JY7upUYABnGqWdozRi" );

    const vault = new PublicKey(hexToSolanaBase58(vaultAddress));
    log.debug(TAG, "Vault:", vault);

    const tokenBridgeClaim = deriveClaimKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        parsedVaa.emitterAddress,
        parsedVaa.emitterChain,
        parsedVaa.sequence
    );
    log.debug(TAG, `tokenBridgeClaim expected: ${tokenBridgeClaim.toBase58()}`);
    log.debug(TAG, `tokenBridgeClaim expected: 4hqE1jUJTtqmBesdeD3EzSBZBnzx8sWwqHq35HgZzkMA`);

    const tokenBridgeConfig = deriveTokenBridgeConfigKey(TOKEN_BRIDGE_PROGRAM_ID);
    log.debug(TAG, `tokenBridgeConfig expected: ${tokenBridgeConfig.toBase58()}`);
    log.debug(TAG, `tokenBridgeConfig expected: 8PFZNjn19BBYVHNp4H31bEW7eAmu78Yf2RKV8EeA461K`);

    const tokenBridgeForeignEndpoint = deriveEndpointKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        parsedVaa.emitterChain,
        parsedVaa.emitterAddress
    );
    log.debug(TAG, `tokenBridgeForeignEndpoint expected: ${tokenBridgeForeignEndpoint.toBase58()}`);
    log.debug(TAG, `tokenBridgeForeignEndpoint expected: ErgSoGgESgjk9Jc4u61URqPUwx3yjW6htUShBkiFW6ui`);


    const tokenBridgeMintAuthority = deriveMintAuthorityKey(TOKEN_BRIDGE_PROGRAM_ID);
    log.debug(TAG, `tokenBridgeMintAuthority expected: ${tokenBridgeMintAuthority.toBase58()}`);
    log.debug(TAG, `tokenBridgeMintAuthority expected: rRsXLHe7sBHdyKU3KY3wbcgWvoT1Ntqudf6e9PKusgb`);


    const tokenBridgeWrappedMint = deriveWrappedMintKey(
        TOKEN_BRIDGE_PROGRAM_ID,
        transferPayload.originChain,
        Buffer.from(transferPayload.originAddress, "hex")
    );
    log.debug(TAG, `tokenBridgeWrappedMint expected: ${tokenBridgeWrappedMint.toBase58()}`);
    log.debug(TAG, `tokenBridgeWrappedMint expected: 23Adx8na44L3M1Nf9RrUpQPb41eufdRXKseg25FfcJtw`);

    const [depositPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("received"),
            vaaHashBuffer
        ],
        wormholeProgram.programId
    );
    log.debug(TAG, `depositPDA expected: ${depositPDA.toBase58()}`);

    const accountant = new PublicKey("EqMiuTEZuZLUWfZXLbPaT54Snqcq3asoecMdtny7rJC7");

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
                accountant: accountant,
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
    const hexVAA = mockRedisValue.vaa

    const payer = getBotKeypair()

    // Set up the manager.
    const manager = new Manager(payer);

    // Relay VAA.
    await relay(manager, payer, hexVAA);
}

main();