import {parseVaa, getSignedVAAHash} from "@certusone/wormhole-sdk";
import {Buffer} from "buffer";
import {hexToSolanaBase58, toWormholeAddress} from "./utils";
import {Manager} from "./provider/manager";
import {Keypair, PublicKey} from "@solana/web3.js";
import {PRIVATE_KEY} from "./config/config";
import {log} from "./logger/logger"
import {BN} from "@coral-xyz/anchor";
import {deriveClaimKey} from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";

const TAG = "vaaWorker";

const mockRedisValue = {
    vaa: "AQAAAAABAHmkpAZwShegldmgv2ATqCgSY2UGFqaI1QqRQCSZv2W7GG5rmhAUB0d9mzZz3KjJAi36MtliDnynRFbMwIUFByYAZ+ZUnAAAAAAnEgAAAAAAAAAAAAAAANtUkiZfYDiDHon0lWcP+Qmt6UvZAAAAAAAAEfYBAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYagAAAAAAAAAAAAAAAAHH1LGWywx7AddD+8YRapAjeccjgnEoXTocIKaasIHq84dO/e6JTKCmSOaUCwhlTzitgO8QSLAAEAAAAAAAAAAAAAAAAHYjnn2LV99xAnA768Q+KuSM9HB98CDzHKeVQ3v6c2VJSnig3lJQmAcf1VRA+aGgY/EDWtb3ZlvuVur3KVZj3NqntnVs7nc/IbLW0flB0KfbWw++w=",
    emitterChain: 10002,
    emitterAddress: "db5492265f6038831e89f495670ff909ade94bd9",
    sequence: 4598,
    tokenChain: 10002,
    tokenAddress: "0000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238",
    amount: "100000",
    sender: "000000000000000000000000076239e7d8b57df7102703bebc43e2ae48cf4707",
    receiver: {
        chain: 1,
        address: "85d3a1c20a69ab081eaf3874efdee894ca0a648e6940b08654f38ad80ef1048b"
    },
    payload: "df020f31ca795437bfa7365494a78a0de525098071fd55440f9a1a063f1035ad6f7665bee56eaf7295663dcdaa7b6756cee773f21b2d6d1f941d0a7db5b0fbec"
};

let admin: Keypair;

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

function decodeAndParseVaa(base64: string) {
    const buffer = Buffer.from(base64, "base64");
    const parsed = parseVaa(buffer);
    return {buffer, parsed};
}

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

(async function main() {
    admin = getBotKeypair();
    console.log("Bot public key:", admin.publicKey.toBase58());

    const {buffer, parsed} = decodeAndParseVaa(mockRedisValue.vaa);
    const {sharesRecipient, vaultAddress} = decodeVaultPayload(mockRedisValue.payload);

    console.log("VAA Parsed:");
    console.log(`- Version: ${parsed.version}`);
    console.log(`- Emitter Chain: ${parsed.emitterChain}`);
    console.log(`- Emitter Address: ${parsed.emitterAddress.toString("hex")}`);
    console.log(`- Sequence: ${parsed.sequence}`);
    console.log("");

    console.log("TransferWithPayload:");
    console.log(`- Amount: ${mockRedisValue.amount}`);
    console.log(`- Token: ${mockRedisValue.tokenChain}:${mockRedisValue.tokenAddress}`);
    console.log(`- Sender: ${mockRedisValue.sender}`);
    console.log(`- Receiver: ${mockRedisValue.receiver.chain}:${mockRedisValue.receiver.address}`);
    console.log(`- Receiver (Base58): ${hexToSolanaBase58(mockRedisValue.receiver.address)}`);
    console.log(`- Payload: ${mockRedisValue.payload}`);

    console.log("Decoded Vault Payload:");
    console.log(`- sharesRecipient: ${sharesRecipient}`);
    console.log(`- sharesRecipient (Base58): ${hexToSolanaBase58(sharesRecipient)}`);
    console.log(`- vaultAddress: ${vaultAddress}`);
    console.log(`- vaultAddress (Base58): ${hexToSolanaBase58(vaultAddress)}`);

    console.log("Parsed VAA and decoded payload...");

    const accountant = new PublicKey("EqMiuTEZuZLUWfZXLbPaT54Snqcq3asoecMdtny7rJC7");
    const manager = new Manager(admin);
    const wormholeProgram = await manager.getProgram();
    const provider = await manager.getProvider();

    const recipient = new PublicKey(hexToSolanaBase58(sharesRecipient));
    const vault = new PublicKey(hexToSolanaBase58(vaultAddress));

    const vaaHash = getSignedVAAHash(buffer);

    const tokenBridgeProgramId = new PublicKey("DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe")
    const emitterChain = mockRedisValue.emitterChain;
    const emitterAddress = mockRedisValue.emitterAddress;
    const sequence = mockRedisValue.sequence;
    const tokenChain = mockRedisValue.tokenChain.toString();
    const tokenAddress = mockRedisValue.tokenAddress;

    const tokenBridgeClaim = deriveClaimKey(
        tokenBridgeProgramId,
        toWormholeAddress(emitterAddress),
        emitterChain,
        sequence
    );
    log.debug(TAG, `tokenBridgeClaim expected: ${tokenBridgeClaim.toBase58()}`);

    const [tokenBridgeConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        tokenBridgeProgramId
    );
    log.debug(TAG, `tokenBridgeConfig expected: ${tokenBridgeConfig.toBase58()}`);

    const [tokenBridgeForeignEndpoint] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("foreign_endpoint"),
            new BN(emitterChain).toArrayLike(Buffer, "be", 2),
        ],
        tokenBridgeProgramId
    );
    log.debug(TAG, `tokenBridgeForeignEndpoint expected: ${tokenBridgeForeignEndpoint.toBase58()}`);

    const [tokenBridgeMintAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint_signer")],
        tokenBridgeProgramId
    );
    log.debug(TAG, `tokenBridgeMintAuthority expected: ${tokenBridgeMintAuthority.toBase58()}`);

    const [tokenBridgeWrappedMint] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("wrapped"),
            new BN(tokenChain).toArrayLike(Buffer, "be", 2),
            Buffer.from(tokenAddress, "hex"),
        ],
        tokenBridgeProgramId
    );
    log.debug(TAG, `tokenBridgeWrappedMint expected: ${tokenBridgeWrappedMint.toBase58()}`);

    const [depositPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("received"),
            Buffer.from(vaaHash, "hex")
        ],
        wormholeProgram.programId
    );
    log.debug(TAG, `depositPDA expected: ${depositPDA.toBase58()}`);

    const tx1 = await wormholeProgram.methods
        .receive(vaaHash)
        .accounts({
            payer: provider.wallet.publicKey,
            tokenBridgeClaim: tokenBridgeClaim,
            tokenBridgeConfig: tokenBridgeConfig,
            tokenBridgeForeignEndpoint: tokenBridgeForeignEndpoint,
            tokenBridgeMintAuthority: tokenBridgeMintAuthority,
            tokenBridgeWrappedMint: tokenBridgeWrappedMint,
            recipient,
        })
        .signers([admin])
        .rpc();

    console.log("Receive tx:", tx1);

    const tx2 = await wormholeProgram.methods
        .executeDeposit()
        .accounts({
            deposit: depositPDA,
            recipient,
            vault,
            accountant: accountant,
            underlyingMint: tokenBridgeWrappedMint,
        })
        .rpc();

    console.log("ExecuteDeposit tx:", tx2);
})();