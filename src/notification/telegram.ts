import axios from 'axios';

const telegramEnabled = process.env.TELEGRAM_NOTIFICATIONS === 'true';
const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
const telegramChatId = process.env.TELEGRAM_CHAT_ID || '';

const telegramBaseUrl = 'https://api.telegram.org/bot';

export async function sendTelegram(message: string) {
    if (!telegramEnabled || !telegramToken || !telegramChatId) return;

    const url = `${telegramBaseUrl}${telegramToken}/sendMessage`;
    const payload = {
        chat_id: telegramChatId,
        text: message,
    };

    try {
        await axios.post(url, payload);
    } catch (err) {
        console.error('Telegram send error:', err);
    }
}