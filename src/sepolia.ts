import { ethers } from "ethers";
import bs58 from "bs58";
import { Buffer } from "buffer";
import * as dotenv from "dotenv";

dotenv.config();

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || ""; // Sepolia private key
const TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // e.g., USDC
const TOKEN_BRIDGE_ADDRESS = "0xDB5492265f6038831E89f495670FF909aDe94bd9";
const WORMHOLE_CORE_ADDRESS = "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78"; // optional, for fee

// Solana addresses
const sharesRecipient = "G1XjoJpF6NvfSsbkreefjQgTf4JY7upUYABnGqWdozRi"; //"0xdf020f31ca795437bfa7365494a78a0de525098071fd55440f9a1a063f1035ad";
const vaultAddress = "FaqoPQMz7d5bkdx7BWNW7F1iFP9JxEDdDHPf42XaDkU6"; //"0xd8aef6345ab567d48fa84fc351e1b26cff3577a8cf4663d291f064781504b49f";
const targetContract = process.env.WORMHOLE_RELAYER || "3VHYnZXdvZYPkHdDxsTyAfKaYzW1tm7kuR5NqPp249x5"; //"0x75c09f8e5c825380a835680486e01a767ee3ed2d0fa487aa04e44e8dfcc92a23"; // Solana program
const recipientChain = 1; // Solana
const amount = ethers.utils.parseUnits("0.1", 6); // 0.1 USDC
const batchId = 0;

const tokenBridgeAbi = [
    "function transferTokensWithPayload(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint32 batchId, bytes memory payload) external payable returns (uint64 sequence)",
];

function solanaAddressToBytes32(solanaAddress: string): string {
    const bytes = Buffer.from(bs58.decode(solanaAddress));
    if (bytes.length > 32) throw new Error("Address too long");

    const padded = Buffer.alloc(32);
    bytes.copy(padded, 32 - bytes.length); // zero-left-pad
    return "0x" + padded.toString("hex");
}

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

    const tokenBridge = new ethers.Contract(TOKEN_BRIDGE_ADDRESS, tokenBridgeAbi, wallet);
    const token = new ethers.Contract(TOKEN_ADDRESS, ["function approve(address,uint256) public returns (bool)"], wallet);

    // Get fee
    const wormhole = new ethers.Contract(
        WORMHOLE_CORE_ADDRESS,
        ["function messageFee() view returns (uint256)"],
        provider
    );
    const fee = await wormhole.messageFee();
    console.log("Wormhole fee:", ethers.utils.formatEther(fee));

    // Approve token bridge
    const approveTx = await token.approve(TOKEN_BRIDGE_ADDRESS, amount);
    await approveTx.wait();
    console.log("Token approved");

    // Build payload: payloadID + sharesRecipient + vaultAddress
    const payload = ethers.utils.solidityPack(
        ["uint8", "bytes32", "bytes32"],
        [1, solanaAddressToBytes32(sharesRecipient), solanaAddressToBytes32(vaultAddress)]
    );

    // Send tokens with payload
    const tx = await tokenBridge.transferTokensWithPayload(
        TOKEN_ADDRESS,
        amount,
        recipientChain,
        solanaAddressToBytes32(targetContract),
        batchId,
        payload,
        { value: fee }
    );
    console.log("Tx sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Tx confirmed:", receipt.transactionHash);
}

main().catch(console.error);