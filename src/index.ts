import { startWebServer } from "./web-server";
import { startRelayer } from "./relayer";
import {initRedis, quitRedis} from "./redis/redis";
import {initPgStorage} from "./pg-storage/client";

async function main() {
    await initPgStorage();
    await initRedis();

    startWebServer();

    await startRelayer();
}

main().catch((err) => {
    console.error("Fatal error in main:", err);
    process.exit(1);
});

process.on("SIGINT", async () => {
    await quitRedis();
    process.exit();
});

process.on("SIGTERM", async () => {
    await quitRedis();
    process.exit();
});