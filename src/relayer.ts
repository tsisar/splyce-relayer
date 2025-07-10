import {
    StandardRelayerApp,
    StandardRelayerContext,
    Middleware,
} from "@wormhole-foundation/relayer-engine";
import {
    CHAIN_ID_SOLANA,
    ChainId
} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import { tryHexToNativeString } from "@certusone/wormhole-sdk/lib/cjs/utils/array";
import { TokenBridgePayload } from "@certusone/wormhole-sdk";
import { processVaa } from "./worker";
import {
    SPY_HOST,
    SPY_PORT,
    SOLANA_WORMHOLE_RELAYER,
    SOLANA_EXTERNAL_AGGREGATOR_WORMHOLE,
    WORMHOLE_RPC_ENDPOINT,
    REDIS_HOST,
    REDIS_PORT,
    EMITTERS,
    WORMHOLE_ENVIRONMENT,
    getStartingSequenceConfig, INSTANCE_NAME
} from "./config/config";

import {
    error,
    info
} from "./notification/notification";
import { CustomConsoleTransport } from "./logger/custom-transport";
import winston from "winston";
import {sendToQueue} from "./rabbitmq/rabbitmq";

export const winstonLogger = winston.createLogger({
    level: "debug",
    format: winston.format.simple(),
    transports: [new CustomConsoleTransport()],
});

const filter: Middleware<StandardRelayerContext> = async (ctx, next) => {
    const payload = ctx.tokenBridge?.payload;

    if (!payload) {
        ctx.logger.warn("TokenBridge payload is missing");
        return;
    }

    const payloadType = payload.payloadType;
    if (payloadType !== TokenBridgePayload.TransferWithPayload) {
        ctx.logger.debug(`Filtered out payload type: ${payloadType}`);
        return;
    }

    const to = payload.to;
    const toChain = payload.toChain;

    if (!to || toChain === undefined) {
        ctx.logger.warn("Missing 'to' or 'toChain' in payload");
        return;
    }

    const toChainTyped = toChain as ChainId;
    const toAddressHex = to.toString("hex");

    let receiver: string;
    try {
        receiver = tryHexToNativeString(toAddressHex, toChainTyped);
    } catch (e) {
        ctx.logger.error(`Failed to convert address for chain ${toChain}: ${e}`);
        return;
    }

    if (toChainTyped !== CHAIN_ID_SOLANA) {
        ctx.logger.debug(`Filtered out toChain: ${toChainTyped}`);
        return;
    }

    if (receiver !== SOLANA_WORMHOLE_RELAYER && receiver !== SOLANA_EXTERNAL_AGGREGATOR_WORMHOLE) {
        ctx.logger.debug(`Filtered out receiver: ${receiver}`);
        ctx.logger.debug(`Expected: ${SOLANA_WORMHOLE_RELAYER} or ${SOLANA_EXTERNAL_AGGREGATOR_WORMHOLE}, got: ${receiver}`);
        return;
    }

    return next();
};

export async function startRelayer() {
    await info('Service started successfully');

    const app = new StandardRelayerApp<StandardRelayerContext>(
        WORMHOLE_ENVIRONMENT,
        {
            name: INSTANCE_NAME,
            spyEndpoint: `${SPY_HOST}:${SPY_PORT}`, // Endpoint for Wormhole Spy to receive live VAAs
            wormholeRpcs: [WORMHOLE_RPC_ENDPOINT], // Wormhole RPC endpoints used to fetch VAAs (especially for backfill)
            // Redis configuration used for seenVaas, missedVaas tracking, and BullMQ job queues
            redis: {
                host: REDIS_HOST,
                port: REDIS_PORT,
            },
            maxCompletedQueueSize: 0, // Limit how many successfully processed jobs are stored in Redis (0 = don't keep)
            maxFailedQueueSize: 100,  // Limit how many failed jobs are stored in Redis (for diagnostics)
            // Configuration for the missed VAA recovery worker (backfill logic)
            missedVaaOptions: {
                concurrency: 1,  // Number of concurrent missed VAA processing jobs/ should be 1 because of we use 1 key in worker
                checkInterval: 15000, // Interval (ms) between checks for missed VAAs
                fetchVaaRetries: 3, // How many times to retry fetching a missed VAA
                vaasFetchConcurrency: 4, // Number of VAA fetches to run in parallel
                // Explicit starting sequence for each emitter if no seenVaas exist in Redis
                startingSequenceConfig: getStartingSequenceConfig(),
            },
            logger: winstonLogger,
        }
    );

    app.use(filter);

    for (const { chainId, address } of EMITTERS) {
        app.chain(chainId).address(address, async (ctx, next) => {
            await handleTransferWithPayload(ctx);
            return next();
        });
    }

    await app.listen();
}

async function handleTransferWithPayload(ctx: any): Promise<void> {
    const { vaa, tokenBridge, sourceTxHash } = ctx;

    if (!vaa || !tokenBridge?.payload) {
        ctx.logger.warn("Missing VAA or tokenBridge payload, skipping detailed logging");
        return;
    }

    const payload = tokenBridge.payload;

    const token = `${payload.tokenChain}:${payload.tokenAddress.toString("hex")}`;
    const amount = payload.amount;
    const sender = payload.fromAddress?.toString("hex");
    const receiverAddress = payload.to.toString("hex");
    const receiver = tryHexToNativeString(receiverAddress, payload.toChain as ChainId);
    const target = `${payload.toChain}:${receiver}`;
    const txHash = sourceTxHash;
    const vaaBase64 = vaa.bytes.toString("base64");
    const emitterAddress = vaa.emitterAddress.toString("hex");
    const sequence = vaa.sequence.toString();
    const emitterChain = vaa.emitterChain;

    ctx.logger.info(`VAA received — chain: ${vaa.emitterChain}, seq: ${vaa.sequence}`);
    ctx.logger.info(
        [
            `TransferWithPayload Details:`,
            `  • Token:   ${token}`,
            `  • Amount:  ${amount}`,
            `  • Sender:  ${sender}`,
            `  • Receiver:${target}`,
            `  • Payload: ${payload.tokenTransferPayload.toString("hex")}`,
            `  • TxHash:  ${txHash}`,
        ].join("\n")
    );

    try {
        if (receiver.toString() === SOLANA_WORMHOLE_RELAYER) {
            await processVaa(emitterChain, emitterAddress, sequence, vaaBase64);
        } else {
            await sendToQueue("vaa_queue", {emitterChain, emitterAddress, sequence, vaaBase64, receiver,});
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        await error(`Error processing VAA: ${message}\nSequence: ${sequence}\nSource Tx Hash: ${sourceTxHash}`);
        throw new Error(`Error processing VAA: ${message}`);
    }
}