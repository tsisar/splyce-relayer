const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const TOKEN_BRIDGE_ADDRESS = "0xDB5492265f6038831E89f495670FF909aDe94bd9";
const WORMHOLE_CORE_ADDRESS = "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78";
const targetContract = "9tLc6Tt91mxiCsaN4KvVVxZen2HTUtTz3w2UfgqFArvT";
const sharesRecipient = "G1XjoJpF6NvfSsbkreefjQgTf4JY7upUYABnGqWdozRi";
const vaultAddress = "FaqoPQMz7d5bkdx7BWNW7F1iFP9JxEDdDHPf42XaDkU6";

let provider;
let signer;

function showLoading() {
    document.getElementById("loading-overlay")?.classList.remove("d-none");
}

function hideLoading() {
    document.getElementById("loading-overlay")?.classList.add("d-none");
}

function solanaAddressToBytes32(solanaAddress) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const BASE = BigInt(58);

    let decoded = BigInt(0);
    for (let i = 0; i < solanaAddress.length; i++) {
        const char = solanaAddress[i];
        const index = ALPHABET.indexOf(char);
        if (index === -1) throw new Error('Invalid Base58 character');
        decoded = decoded * BASE + BigInt(index);
    }

    let bytes = [];
    while (decoded > 0) {
        bytes.push(Number(decoded % BigInt(256)));
        decoded /= BigInt(256);
    }

    for (let i = 0; i < solanaAddress.length && solanaAddress[i] === '1'; i++) {
        bytes.push(0);
    }

    bytes = bytes.reverse();
    if (bytes.length > 32) throw new Error('Address too long');

    const padded = new Uint8Array(32);
    padded.set(bytes, 32 - bytes.length);
    return '0x' + Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        document.getElementById("walletAddress").innerText = "Connected: " + address;
    } else {
        alert("No wallet found. Please install MetaMask.");
    }
}

document.getElementById("connectWallet").onclick = connectWallet;

document.getElementById("transferForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading();
    const submitBtn = e.submitter;
    if (submitBtn) submitBtn.disabled = true;

    const amount = document.getElementById("amount").value;
    const resultDiv = document.getElementById("result");

    try {
        if (!signer) await connectWallet();
        if (!signer) {
            alert("Wallet not connected.");
            return;
        }

        const token = new ethers.Contract(TOKEN_ADDRESS, ["function approve(address,uint256) public returns (bool)"], signer);
        const tokenBridge = new ethers.Contract(TOKEN_BRIDGE_ADDRESS, [
            "function transferTokensWithPayload(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint32 batchId, bytes memory payload) external payable returns (uint64 sequence)",
        ], signer);
        const wormhole = new ethers.Contract(WORMHOLE_CORE_ADDRESS, ["function messageFee() view returns (uint256)"], signer);

        const fee = await wormhole.messageFee();
        const usdcAmount = ethers.utils.parseUnits(amount, 6);

        const approveTx = await token.approve(TOKEN_BRIDGE_ADDRESS, usdcAmount);
        await approveTx.wait();

        const payload = ethers.utils.solidityPack(
            ["uint8", "bytes32", "bytes32"],
            [1, solanaAddressToBytes32(sharesRecipient), solanaAddressToBytes32(vaultAddress)]
        );
        const recipient = solanaAddressToBytes32(targetContract);

        const tx = await tokenBridge.transferTokensWithPayload(
            TOKEN_ADDRESS,
            usdcAmount,
            1,
            recipient,
            0,
            payload,
            { value: fee }
        );

        resultDiv.innerHTML = `<div class="alert alert-success">Transaction sent: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash}</a></div>`;
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    } finally {
        hideLoading();
        if (submitBtn) submitBtn.disabled = false;
    }
});