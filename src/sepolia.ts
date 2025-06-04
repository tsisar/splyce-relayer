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
const sharesRecipient = "ADRLCFoG3YN4WMRA19oRJbjCJMx2UAfPFbDRe4DkqZWL";
const vaultAddress = "aVcb2fmzwjCXo3wj67xycmyg9abSwxtWPWygpUnBbBh";
const targetContract = process.env.WORMHOLE_RELAYER || "5rZjdjjQf3pmfRGEK3AaG56Z5TGPDb2jLiv8uh1v4PXi";
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

    const recipient = solanaAddressToBytes32(targetContract);
    console.log("Recipient:", recipient);

    // Send tokens with payload
    const tx = await tokenBridge.transferTokensWithPayload(
        TOKEN_ADDRESS,
        amount,
        recipientChain,
        recipient,
        batchId,
        payload,
        { value: fee }
    );
    console.log("Tx sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Tx confirmed:", receipt.transactionHash);
}

main().catch(console.error);