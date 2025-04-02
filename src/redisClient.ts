import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

let client: ReturnType<typeof createClient> | null = null;

export async function initRedisClient(): Promise<void> {
    if (client) return;

    const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
    const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

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