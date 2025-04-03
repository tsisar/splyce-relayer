import axios from 'axios';
import {processVAA} from "./worker";
import {log} from "./logger/logger";

const emitterChain = 10002; // Sepolia
const emitterAddress = "db5492265f6038831e89f495670ff909ade94bd9"; // Token Bridge
const sequence = 4600;

const endpoints = [
    `https://api.testnet.wormholescan.io/v1/signed_vaa/${emitterChain}/${emitterAddress}/${sequence}`
];

const TAG = "backfillVaa";

async function fetchVAA() {
    for (const url of endpoints) {
        try {
            log.debug(TAG, `Fetching VAA from ${url}`);
            const res = await axios.get(url, { timeout: 5000 });

            let base64: string | null = null;

            if (res.data.vaaBytes) base64 = res.data.vaaBytes;
            else if (res.data.data?.vaa) base64 = res.data.data.vaa;
            else if (typeof res.data === 'string') base64 = res.data;

            if (base64) {
                log.debug(TAG, "base64 data:", base64);

                await processVAA(base64);

                return base64;
            }

            console.warn("Unexpected response format:", res.data);
        } catch (err) {
            console.warn(`Failed to fetch from ${url}:`, err.message || err);
        }
    }

    throw new Error("Could not fetch VAA from any endpoint.");
}

fetchVAA().then((vaa) => {
    log.debug(TAG, "Final VAA buffer length:", vaa.length);
}).catch(console.error);