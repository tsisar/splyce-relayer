import axios from 'axios';
import {processVaa} from "./worker";
import {log} from "./logger/logger";
import {WORMHOLE_RPC_ENDPOINT} from "./config/config";

const TAG = "recoverVaa";

export async function recoverVaa(emitterChain: number, emitterAddress: string, sequence: string, force: boolean = false): Promise<string> {
    log.info(TAG, `Recovering VAA for emitterChain: ${emitterChain}, emitterAddress: ${emitterAddress}, sequence: ${sequence}`);

    const endpoints = [
        `${WORMHOLE_RPC_ENDPOINT}/v1/signed_vaa/${emitterChain}/${emitterAddress}/${sequence}`
    ];

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
                await processVaa(emitterChain, emitterAddress, sequence.toString(), base64, force);

                return base64;
            }

            console.warn("Unexpected response format:", res.data);
        } catch (err) {
            console.warn(`Failed to fetch from ${url}:`, err);
        }
    }

    throw new Error("Failed to fetch VAA.");
}
