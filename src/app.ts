import {
    Environment,
    StandardRelayerApp,
    StandardRelayerContext,
    Middleware,
} from "@wormhole-foundation/relayer-engine";
import {CHAIN_ID_OPTIMISM, TokenBridgePayload} from "@certusone/wormhole-sdk";
import * as dotenv from "dotenv";
import {
    CHAIN_ID_SOLANA,
    CHAIN_ID_SEPOLIA,
    CHAIN_ID_ARBITRUM,
} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import { getRedisClient, initRedisClient } from "./redisClient";
import { hexToSolanaBase58 } from "./utils";
import { processVAA } from "./worker";

dotenv.config();

const WORMHOLE_RPC_ENDPOINT = process.env.WORMHOLE_RPC_ENDPOINT || "https://api.testnet.wormholescan.io";
const SPY_HOST = process.env.SPY_HOST || "localhost";
const SPY_PORT = process.env.SPY_PORT ? Number(process.env.SPY_PORT) : 7073;

const EMITTERS = [
    { chainId: CHAIN_ID_SEPOLIA, address: "0xDB5492265f6038831E89f495670FF909aDe94bd9" },
    { chainId: CHAIN_ID_ARBITRUM, address: "0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e" },
    { chainId: CHAIN_ID_OPTIMISM, address: "0x99737Ec4B815d816c49A385943baf0380e75c0Ac" },
];

(async function main() {
    await initRedisClient();
    const redis = getRedisClient();

    const app = new StandardRelayerApp<StandardRelayerContext>(
        Environment.TESTNET,
        {
            name: `SplyceRelayerMultiChain`,
            spyEndpoint: `${SPY_HOST}:${SPY_PORT}`,
            //wormholeRpcs: [WORMHOLE_RPC_ENDPOINT],
        },
    );

    // Middleware: filter TransferWithPayload to Solana & specific receiver
    const onlyTransferWithPayload: Middleware<StandardRelayerContext> = async (ctx, next) => {
        const payloadType = ctx.tokenBridge?.payload?.payloadType;
        const toChain = ctx.tokenBridge?.payload?.toChain;
        const receiver = hexToSolanaBase58(ctx.tokenBridge?.payload?.to.toString("hex"));

        if (payloadType !== TokenBridgePayload.TransferWithPayload) {
            ctx.logger.debug(`Filtered out payload type: ${payloadType}`);
            return;
        }

        if (toChain !== CHAIN_ID_SOLANA) {
            ctx.logger.debug(`Filtered out toChain: ${toChain}`);
            return;
        }

        if (receiver !== "8vf4LsW4saqaGVJNj1mZNYX88ojp9hYc1EEnwCHWHCGa") {
            ctx.logger.debug(`Filtered out receiver: ${receiver}`);
            return;
        }

        return next();
    };

    //app.use(onlyTransferWithPayload);

    for (const { chainId, address } of EMITTERS) {
        app.chain(chainId).address(address, async (ctx, next) => {
            ctx.logger.info(`VAA from chain ${chainId}, seq ${ctx.vaa?.sequence}`);

            const { payload } = ctx.tokenBridge!;

            ctx.logger.info(
                `TransferWithPayload processing for: \n` +
                `\tToken: ${payload.tokenChain}:${payload.tokenAddress.toString("hex")}\n` +
                `\tAmount: ${payload.amount}\n` +
                `\tSender: ${payload.fromAddress?.toString("hex")}\n` +
                `\tReceiver: ${payload.toChain}:${hexToSolanaBase58(payload.to.toString("hex"))}\n` +
                `\tPayload: ${payload.tokenTransferPayload.toString("hex")}\n`,
            );

            // Store in Redis as JSON
            const emitterChain = ctx.vaa!.emitterChain;
            const emitterAddress = ctx.vaa!.emitterAddress.toString("hex");
            const sequence = ctx.vaa!.sequence;
            const key = `vaa:${emitterChain}:${emitterAddress}:${sequence}`;

            const redisValue = JSON.stringify({
                vaa: ctx.vaa!.bytes.toString("base64"),
            });

            await redis.set(key, redisValue);
            ctx.logger.info(`Saved VAA as JSON to Redis with key: ${key}`);

            await processVAA(ctx.vaa!.bytes.toString("base64"));
            next();
        });
    }

    await app.listen();
})();
