import { createClient } from 'redis';
import {REDIS_HOST, REDIS_PORT} from "../config/config";

let client: ReturnType<typeof createClient> | null = null;

export async function initRedisClient(): Promise<void> {
    if (client) return;

    client = createClient({
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT,
        },
    });

    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    await client.connect();
}

export function getRedisClient() {
    if (!client) throw new Error('Redis client not initialized. Call initRedisClient first.');
    return client;
}