import {
    Environment,
    StandardRelayerApp,
    StandardRelayerContext,
    Middleware,
} from "@wormhole-foundation/relayer-engine";
import {
    CHAIN_ID_SOLANA,
    CHAIN_ID_SEPOLIA,
    CHAIN_ID_ARBITRUM,
    CHAIN_ID_OPTIMISM,
    ChainId,
} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import { tryHexToNativeString } from "@certusone/wormhole-sdk/lib/cjs/utils/array";
import { TokenBridgePayload } from "@certusone/wormhole-sdk";
import { getRedisClient, initRedisClient } from "./redis/redisClient";
import { processVAA } from "./worker";
import {
    ETHEREUM_SEPOLIA_TOKEN_BRIDGE,
    ARBITRUM_SEPOLIA_TOKEN_BRIDGE,
    OPTIMISM_SEPOLIA_TOKEN_BRIDGE,
    SPY_HOST,
    SPY_PORT,
    WORMHOLE_RELAYER,
    WORMHOLE_RPC_ENDPOINT
} from "./config/config";

const EMITTERS = [
    { chainId: CHAIN_ID_SEPOLIA, address: ETHEREUM_SEPOLIA_TOKEN_BRIDGE },
    { chainId: CHAIN_ID_ARBITRUM, address: ARBITRUM_SEPOLIA_TOKEN_BRIDGE },
    { chainId: CHAIN_ID_OPTIMISM, address: OPTIMISM_SEPOLIA_TOKEN_BRIDGE },
];

(async function main() {
    await initRedisClient();
    const redis = getRedisClient();

    const app = new StandardRelayerApp<StandardRelayerContext>(
        Environment.TESTNET,
        {
            name: `Splyce_Relayer_Solana`,
            spyEndpoint: `${SPY_HOST}:${SPY_PORT}`,
            wormholeRpcs: [WORMHOLE_RPC_ENDPOINT],
        },
    );

    // Middleware: filter TransferWithPayload to Solana & specific receiver
    const onlyTransferWithPayload: Middleware<StandardRelayerContext> = async (ctx, next) => {
        const payloadType = ctx.tokenBridge?.payload?.payloadType;
        const toChain = ctx.tokenBridge?.payload?.toChain as ChainId;
        const receiver = tryHexToNativeString(ctx.tokenBridge?.payload?.to.toString("hex"), toChain);

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

    app.use(onlyTransferWithPayload);

    for (const { chainId, address } of EMITTERS) {
        app.chain(chainId).address(address, async (ctx, next) => {
            const vaa = ctx.vaa;
            const hash = ctx.sourceTxHash;

            ctx.logger.info(`VAA from chain ${chainId}, seq ${vaa?.sequence}`);

            const { payload } = ctx.tokenBridge!;

            ctx.logger.info(
                `TransferWithPayload processing for: \n` +
                `\tToken: ${payload.tokenChain}:${payload.tokenAddress.toString("hex")}\n` +
                `\tAmount: ${payload.amount}\n` +
                `\tSender: ${payload.fromAddress?.toString("hex")}\n` +
                `\tReceiver: ${payload.toChain}:${tryHexToNativeString(payload.to.toString("hex"), payload.toChain as ChainId)}\n` +
                `\tPayload: ${payload.tokenTransferPayload.toString("hex")}\n` +
                `\tTxHash: ${hash}\n`,
            );

            // Store in Redis as JSON
            const emitterChain = vaa!.emitterChain;
            const emitterAddress = vaa!.emitterAddress.toString("hex");
            const sequence = vaa!.sequence;
            const key = `vaa:${emitterChain}:${emitterAddress}:${sequence}`;

            const redisValue = JSON.stringify({
                vaa: vaa!.bytes.toString("base64"),
            });

            await redis.set(key, redisValue);
            ctx.logger.info(`Saved VAA as JSON to Redis with key: ${key}`);

            await processVAA(vaa!.bytes.toString("base64"));
            next();
        });
    }

    await app.listen();
})();
