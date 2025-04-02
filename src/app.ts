import {
    Environment,
    StandardRelayerApp,
    StandardRelayerContext,
    Middleware,
} from "@wormhole-foundation/relayer-engine";
import { TokenBridgePayload } from "@certusone/wormhole-sdk";
import * as dotenv from "dotenv";
import {
    CHAIN_ID_SOLANA,
    CHAIN_ID_SEPOLIA,
    CHAIN_ID_ARBITRUM,
} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import { getRedisClient, initRedisClient } from "./redisClient";
import { hexToSolanaBase58 } from "./utils";

dotenv.config();

const WORMHOLE_RPC_ENDPOINT = process.env.WORMHOLE_RPC_ENDPOINT || "http://localhost:3030";
const SPY_HOST = process.env.SPY_HOST || "localhost";
const SPY_PORT = process.env.SPY_PORT ? Number(process.env.SPY_PORT) : 7073;

const EMITTERS = [
    { chainId: CHAIN_ID_SOLANA, address: "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe" },
    { chainId: CHAIN_ID_SEPOLIA, address: "0xDB5492265f6038831E89f495670FF909aDe94bd9" },
    { chainId: CHAIN_ID_ARBITRUM, address: "0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e" },
];

(async function main() {
    await initRedisClient();
    const redis = getRedisClient();

    const app = new StandardRelayerApp<StandardRelayerContext>(
        Environment.TESTNET,
        {
            name: `SplyceRelayerMultiChain`,
            spyEndpoint: `${SPY_HOST}:${SPY_PORT}`,
            wormholeRpcs: [WORMHOLE_RPC_ENDPOINT],
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

        if (receiver !== "A1QPk26BhDZ4Ugif8xNkijMbc5PqFqM6f94WgYvHtiBk") {
            ctx.logger.debug(`Filtered out receiver: ${receiver}`);
            return;
        }

        return next();
    };

    app.use(onlyTransferWithPayload);

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
                emitterChain,
                emitterAddress,
                sequence,
                tokenChain: payload.tokenChain,
                tokenAddress: payload.tokenAddress.toString("hex"),
                amount: payload.amount.toString(),
                sender: payload.fromAddress?.toString("hex"),
                receiver: {
                    chain: payload.toChain,
                    address: payload.to.toString("hex"),
                },
                payload: payload.tokenTransferPayload.toString("hex"),
            });

            await redis.set(key, redisValue);
            ctx.logger.info(`Saved VAA as JSON to Redis with key: ${key}`);

            next();
        });
    }

    await app.listen();
})();

// TransferWithPayload processing for:
// Token: 10002:0000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238
// Amount: 100000
// Sender: 000000000000000000000000076239e7d8b57df7102703bebc43e2ae48cf4707
// Receiver: 1:85d3a1c20a69ab081eaf3874efdee894ca0a648e6940b08654f38ad80ef1048b
// Payload: df020f31ca795437bfa7365494a78a0de525098071fd55440f9a1a063f1035ad6f7665bee56eaf7295663dcdaa7b6756cee773f21b2d6d1f941d0a7db5b0fbec
// "raw":"AQAAAAABAHmkpAZwShegldmgv2ATqCgSY2UGFqaI1QqRQCSZv2W7GG5rmhAUB0d9mzZz3KjJAi36MtliDnynRFbMwIUFByYAZ+ZUnAAAAAAnEgAAAAAAAAAAAAAAANtUkiZfYDiDHon0lWcP+Qmt6UvZAAAAAAAAEfYBAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYagAAAAAAAAAAAAAAAAHH1LGWywx7AddD+8YRapAjeccjgnEoXTocIKaasIHq84dO/e6JTKCmSOaUCwhlTzitgO8QSLAAEAAAAAAAAAAAAAAAAHYjnn2LV99xAnA768Q+KuSM9HB98CDzHKeVQ3v6c2VJSnig3lJQmAcf1VRA+aGgY/EDWtb3ZlvuVur3KVZj3NqntnVs7nc/IbLW0flB0KfbWw++w=",

// TransferWithPayload processing for:
// Token: 10002:0000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238
// Amount: 100000
// Sender: 000000000000000000000000e3f6b6f0baa7d69879abd29f1917012c0c5e6862
// Receiver: 1:A1QPk26BhDZ4Ugif8xNkijMbc5PqFqM6f94WgYvHtiBk
// Payload: df020f31ca795437bfa7365494a78a0de525098071fd55440f9a1a063f1035ad6f7665bee56eaf7295663dcdaa7b6756cee773f21b2d6d1f941d0a7db5b0fbec
// "raw":"AQAAAAABALOkzt2aRPA0JuBW3aXbcT6MrkUCI5WuLOEeNyVPgCecbNmlOcTm8WDn2dHVTtZbEyZWBzyZDuMf5/kkwTe9OMcAZ+ZgkAAAAAAnEgAAAAAAAAAAAAAAANtUkiZfYDiDHon0lWcP+Qmt6UvZAAAAAAAAEfgBAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYagAAAAAAAAAAAAAAAAHH1LGWywx7AddD+8YRapAjeccjgnEoXTocIKaasIHq84dO/e6JTKCmSOaUCwhlTzitgO8QSLAAEAAAAAAAAAAAAAAADj9rbwuqfWmHmr0p8ZFwEsDF5oYt8CDzHKeVQ3v6c2VJSnig3lJQmAcf1VRA+aGgY/EDWtb3ZlvuVur3KVZj3NqntnVs7nc/IbLW0flB0KfbWw++w=",