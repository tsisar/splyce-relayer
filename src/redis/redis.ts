import { createClient } from 'redis';
import {REDIS_HOST, REDIS_PORT} from "../config/config";
import {log} from "../logger/logger";

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;

const redis = createClient({ url: redisUrl });

redis.on('error', (err) => {
    log.error('Redis client error:', err);
});

let connected = false;

export async function initRedis() {
    if (!connected) {
        await redis.connect();
        connected = true;
    }
}

export async function quitRedis() {
    if (connected) {
        await redis.quit();
        connected = false;
    }
}

export default redis;