import {
    getSignedVAAWithRetry,
    CHAIN_ID_SEPOLIA,
    tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import {processVAA} from "./worker";
import {log} from "./logger/logger";
import {WORMHOLE_RPC_ENDPOINT} from "./config/config";

const emitterChain = CHAIN_ID_SEPOLIA;
const emitterAddress = tryNativeToHexString(
    "0xdb5492265f6038831e89f495670ff909ade94bd9",
    emitterChain
); // Token Bridge address in hex
const sequence = "4636";

const wormholeRPCs = [
    WORMHOLE_RPC_ENDPOINT
];

const TAG = "getVaa";

async function fetchVAA() {
    try {
        log.debug(TAG, `Fetching VAA from Wormhole SDK...`);
        const {vaaBytes} = await getSignedVAAWithRetry(
            wormholeRPCs,
            emitterChain,
            emitterAddress,
            sequence,
            {
                transport: undefined, // fetch default
                retryTimeout: 5000,
                maxRetries: 5,
            }
        );

        const base64 = Buffer.from(vaaBytes).toString("base64");

        log.debug(TAG, "base64 data:", base64);

        //await processVAA(base64);

        return base64;
    } catch (err) {
        console.warn("Failed to fetch VAA via SDK:", err.message || err);
        throw err;
    }
}

fetchVAA().then((vaa) => {
    log.debug(TAG, "Final VAA buffer length:", vaa.length);
}).catch(console.error);