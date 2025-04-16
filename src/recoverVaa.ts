import axios from 'axios';
import {processVaa} from "./worker";
import {log} from "./logger/logger";
import {CHAIN_ID_SEPOLIA, tryNativeToHexString} from "@certusone/wormhole-sdk";
import {WORMHOLE_RPC_ENDPOINT} from "./config/config";
import {getLatestSequence} from "./pg-storage/vaa";
import {ETHEREUM_SEPOLIA_TOKEN_BRIDGE} from "./config/constants";

const emitterChain = CHAIN_ID_SEPOLIA; // Sepolia
const sequence = 4727;
const emitterAddress = tryNativeToHexString(
    ETHEREUM_SEPOLIA_TOKEN_BRIDGE,
    emitterChain
); // Token Bridge address in hex

const endpoints = [
    `${WORMHOLE_RPC_ENDPOINT}/v1/signed_vaa/${emitterChain}/${emitterAddress}/${sequence}`
];

const TAG = "recoverVaa";

async function fetchVaa() {
    const latestSequence: string | null = await getLatestSequence(emitterChain, emitterAddress);
    log.info(TAG, `Latest saved sequence for ${emitterChain}/${emitterAddress}: ${latestSequence}`);

    for (const url of endpoints) {
        try {
            log.debug(TAG, `Fetching VAA from ${url}`);
            const res = await axios.get(url, {timeout: 5000});

            let base64: string | null = null;

            if (res.data.vaaBytes) base64 = res.data.vaaBytes;
            else if (res.data.data?.vaa) base64 = res.data.data.vaa;
            else if (typeof res.data === 'string') base64 = res.data;

            if (base64) {
                log.debug(TAG, "base64 data:", base64);

                // PROCESS VAA
                await processVaa(base64);

                return base64;
            }

            console.warn("Unexpected response format:", res.data);
        } catch (err) {
            console.warn(`Failed to fetch from ${url}:`, err);
        }
    }

    throw new Error("Could not fetch VAA from any endpoint.");
}

fetchVaa().then((vaa) => {
    log.debug(TAG, "Final VAA buffer length:", vaa.length);
}).catch(console.error);