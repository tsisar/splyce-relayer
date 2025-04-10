import axios from 'axios';

const slackEnabled = process.env.SLACK_NOTIFICATIONS === 'true';
const slackChannel = process.env.SLACK_CHANNEL || '';
const slackBaseUrl = 'https://hooks.slack.com/services';

export async function sendSlack(message: string) {
    if (!slackEnabled || !slackChannel) return;

    const url = `${slackBaseUrl}/${slackChannel}`;
    try {
        await axios.post(url, { text: message });
    } catch (err) {
        console.error('Slack send error:', err);
    }
}