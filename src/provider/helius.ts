import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import * as config from "../config/config";
import {log} from "../logger/logger";

const TAG = "Helius";
let avgPriorityFee = 0;

type HeliusPriorityFeeResponse = {
    jsonrpc: string;
    id: string;
    result?: {
        priorityFeeEstimate?: number;
    };
};

/**
 * Updates the average priority fee.
 * @param priorityFee - The fetched priority fee value.
 * @returns The updated average priority fee.
 */
function updateAverage(priorityFee?: number): number {
    if (priorityFee !== undefined && priorityFee !== null) {
        if (avgPriorityFee === 0) {
            avgPriorityFee = priorityFee;
        } else {
            avgPriorityFee = (avgPriorityFee + priorityFee) / 2;
        }
    }
    avgPriorityFee = Math.round(avgPriorityFee);
    log.debug(TAG, "Avg Priority Fee:", avgPriorityFee);
    return avgPriorityFee;
}

/**
 * Fetches the priority fee from Helium RPC for the given VersionedTransaction.
 * @param versionedTx - The VersionedTransaction for which to estimate the priority fee.
 * @param rpcEndpoint - The RPC endpoint URL (e.g., from process.env.RPC_ENDPOINT).
 * @param priorityLevel - The desired priority level (e.g., "Medium").
 * @returns The priority fee value or undefined.
 */
export async function getPriorityFee(
    versionedTx: VersionedTransaction,
    rpcEndpoint: string = config.SOLANA_RPC_ENDPOINT,
    priorityLevel: string = config.PRIORITY_LEVEL
): Promise<number | undefined> {
    log.debug(TAG, "Priority Level:", priorityLevel);

    const serializedTx = versionedTx.serialize();
    const txSize = serializedTx.length;
    log.debug(TAG, `Transaction size: ${txSize} bytes`);

    const encodedTx = bs58.encode(serializedTx);

    try {
        const response = await fetch(rpcEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "1",
                method: "getPriorityFeeEstimate",
                params: [
                    {
                        transaction: encodedTx, // Pass the serialized transaction in Base58 format
                        options: { priorityLevel },
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            log.error(TAG, `HTTP error! status: ${response.status}, body: ${errorBody}`);
            return undefined;
        }

        const data = (await response.json()) as HeliusPriorityFeeResponse;
        //log.debug(TAG, "Response from Helium RPC:", data);

        const priorityFee = data.result?.priorityFeeEstimate;
        updateAverage(priorityFee);

        return priorityFee === undefined || priorityFee < avgPriorityFee ? avgPriorityFee : priorityFee;
    } catch (error) {
        log.error(TAG, "Error fetching priority fee:", error);
        return undefined;
    }
}