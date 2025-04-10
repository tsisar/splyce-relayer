import crypto from 'crypto';
import { sendTelegram } from './telegram';
import { sendSlack } from './slack';
import redis from '../redis/redis';

const appName = process.env.APP_NAME || '';
const version = process.env.VERSION || 'unknown';
const environment = process.env.ENVIRONMENT || '';
const messageTTL = Number(process.env.MESSAGE_TTL || '60') * 60 * 1000;

function hashMessage(msg: string): string {
    return crypto.createHash('sha256').update(msg).digest('hex');
}

export async function error(message: string) {
    await sendMsg(`🔴 ERROR\n${message}`);
}

export async function warning(message: string) {
    await sendMsg(`🟡 WARNING\n${message}`);
}

export async function info(message: string) {
    await sendMsg(`🟢 INFO\n${message}`);
}

async function sendMsg(message: string) {
    const hash = hashMessage(message);
    const now = Date.now();

    const redisKey = `splyce:wormhole:relayer:notification:msg_status:${hash}`;
    const lastSentStr = await redis.get(redisKey);
    const lastSent = lastSentStr ? parseInt(lastSentStr) : 0;

    if (now - lastSent < messageTTL) {
        await redis.set(redisKey, now.toString(), { PX: messageTTL }); // оновити TTL
        return;
    }

    await redis.set(redisKey, now.toString(), { PX: messageTTL });

    const messageToSend = `${message}\n${appName} version ${version}\nenv: ${environment}`;

    await Promise.all([
        sendTelegram(messageToSend),
        sendSlack(messageToSend),
    ]);
}