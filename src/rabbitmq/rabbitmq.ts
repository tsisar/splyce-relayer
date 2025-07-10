import amqp from "amqplib";
import {RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASSWORD} from "../config/config";

let channel: amqp.Channel;

export async function initRabbitMQ(): Promise<void> {
    const queueName = "vaa_queue";

    const rabbitUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

    const connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
}

export async function sendToQueue(queueName: string, payload: {
    emitterChain: number;
    emitterAddress: string;
    sequence: string;
    vaaBase64: string;
    receiver: string;
}): Promise<void> {
    if (!channel) throw new Error("RabbitMQ channel not initialized");

    const message = JSON.stringify(payload);
    channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
}