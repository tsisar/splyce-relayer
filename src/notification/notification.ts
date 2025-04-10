import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {sendTelegram} from "./telegram";
import {sendSlack} from "./slack";

const appName = process.env.APP_NAME || '';
const version = process.env.VERSION || 'unknown';
const environment = process.env.ENVIRONMENT || '';

const messageTTL = Number(process.env.MESSAGE_TTL || '60') * 60 * 1000;
const messageStatusFile = path.join(process.cwd(), 'message_status.json');

let messageStatus: Record<string, number> = {};

loadMessageStatus();

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

    const lastSent = messageStatus[hash];
    if (lastSent && now - lastSent < messageTTL) {
        messageStatus[hash] = now;
        saveMessageStatus();
        return;
    }

    messageStatus[hash] = now;
    saveMessageStatus();

    const messageToSend = `${message}\n${appName} version ${version}\nenv: ${environment}`;

    await Promise.all([
        sendTelegram(messageToSend),
        sendSlack(messageToSend),
    ]);
}

function loadMessageStatus() {
    try {
        if (fs.existsSync(messageStatusFile)) {
            const raw = fs.readFileSync(messageStatusFile, 'utf-8');
            messageStatus = JSON.parse(raw);
        }
    } catch (err) {
        console.error('Error loading message status:', err);
    }
}

function saveMessageStatus() {
    try {
        fs.writeFileSync(messageStatusFile, JSON.stringify(messageStatus));
    } catch (err) {
        console.error('Error saving message status:', err);
    }
}