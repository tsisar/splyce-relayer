import {
    Environment,
    StandardRelayerApp,
    StandardRelayerContext,
    Middleware,
} from "@wormhole-foundation/relayer-engine";
import {
    CHAIN_ID_SOLANA,
    CHAIN_ID_SEPOLIA,
    CHAIN_ID_BSC,
    ChainId,
} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import { tryHexToNativeString } from "@certusone/wormhole-sdk/lib/cjs/utils/array";
import { TokenBridgePayload } from "@certusone/wormhole-sdk";
import { processVaa } from "./worker";
import {
    ETHEREUM_SEPOLIA_TOKEN_BRIDGE,
    BNB_SMART_CHAIN_TOKEN_BRIDGE,
    SPY_HOST,
    SPY_PORT,
    WORMHOLE_RELAYER,
    WORMHOLE_RPC_ENDPOINT,
    REDIS_HOST,
    REDIS_PORT
} from "./config/config";
import { initPgStorage } from "./pg-storage/client";
import { saveVaaToPostgres } from "./pg-storage/vaa";

const EMITTERS = [
    { chainId: CHAIN_ID_SEPOLIA, address: ETHEREUM_SEPOLIA_TOKEN_BRIDGE },
    { chainId: CHAIN_ID_BSC, address: BNB_SMART_CHAIN_TOKEN_BRIDGE },
];

// Middleware: filter TransferWithPayload to Solana & specific receiver
const filter: Middleware<StandardRelayerContext> = async (ctx, next) => {
    const payloadType = ctx.tokenBridge?.payload?.payloadType;
    const toChain = ctx.tokenBridge?.payload?.toChain as ChainId;
    const toAddress = ctx.tokenBridge?.payload?.to.toString() as string;
    const receiver = tryHexToNativeString(toAddress, toChain);

    if (payloadType !== TokenBridgePayload.TransferWithPayload) {
        ctx.logger.debug(`Filtered out payload type: ${payloadType}`);
        return;
    }

    if (toChain !== CHAIN_ID_SOLANA) {
        ctx.logger.debug(`Filtered out toChain: ${toChain}`);
        return;
    }

    if (receiver !== WORMHOLE_RELAYER) {
        ctx.logger.debug(`Filtered out receiver: ${receiver}`);
        return;
    }

    return next();
};

(async function main() {
    await initPgStorage();

    const app = new StandardRelayerApp<StandardRelayerContext>(
        Environment.TESTNET,
        {
            name: `splyce-relayer-solana`,
            spyEndpoint: `${SPY_HOST}:${SPY_PORT}`,
            wormholeRpcs: [WORMHOLE_RPC_ENDPOINT],
            redis: {
                host: REDIS_HOST,
                port: REDIS_PORT,
            },
            maxCompletedQueueSize: 0, // не зберігати успішні jobs
            maxFailedQueueSize: 100, // зберігати лише останні 100 помилок (опційно)
        },
    );

    app.use(filter);

    for (const { chainId, address } of EMITTERS) {
        app.chain(chainId).address(address, async (ctx, next) => {
            const vaa = ctx.vaa;
            const hash = ctx.sourceTxHash;

            ctx.logger.info(`VAA from chain ${chainId}, seq ${vaa?.sequence}`);

            const { payload } = ctx.tokenBridge!;

            ctx.logger.info(
                `TransferWithPayload processing for: \n` +
                `\tToken: ${payload?.tokenChain}:${payload?.tokenAddress.toString("hex")}\n` +
                `\tAmount: ${payload?.amount}\n` +
                `\tSender: ${payload?.fromAddress?.toString("hex")}\n` +
                `\tReceiver: ${payload?.toChain}:${tryHexToNativeString(payload?.to.toString("hex") as string, payload?.toChain as ChainId)}\n` +
                `\tPayload: ${payload?.tokenTransferPayload.toString("hex")}\n` +
                `\tTxHash: ${hash}\n`,
            );

            // Store in Redis as JSON
            const emitterChain = vaa!.emitterChain;
            const emitterAddress = vaa!.emitterAddress.toString("hex");
            const sequence = vaa!.sequence.toString();
            const vaaBase64 = vaa!.bytes.toString("base64");

            await saveVaaToPostgres(emitterChain, emitterAddress, sequence, vaaBase64);
            ctx.logger.info(`Saved VAA to PostgreSQL: ${emitterChain}/${emitterAddress}/${sequence}`);

            await processVaa(vaaBase64);
            next();
        });
    }

    await app.listen();
})();
