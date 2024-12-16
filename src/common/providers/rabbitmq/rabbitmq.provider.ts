import * as amqplib from 'amqplib';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlainRecord } from 'src/common/types/other.type';
import { RabbitmqExchanges, rabbitmqExchangesConfig } from './rabbitmq.config';

@Injectable()
export class RabbitmqProvider {
    private connection: amqplib.Connection;
    private channel: amqplib.Channel;
    private url: string;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.getOrThrow('rabbitmq.host');
        const port = this.configService.getOrThrow('rabbitmq.port');
        this.url = `amqp://${host}:${port}`;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqplib.connect(this.url);
        } catch (error) {
            console.error('Cannot connect to RabbitMQ', error); // @todo: use system logger
            process.exit(1);
        }
        console.log('RabbitMQ connected'); // @todo: use system logger
    }

    async assertChannels(): Promise<void> {
        const channel = await this.connection.createChannel();

        for (const [exchangeTitle, exchangeConfig] of Object.entries(
            rabbitmqExchangesConfig,
        )) {
            console.log(exchangeTitle);
            const exchangeName = this.configService.getOrThrow(
                `rabbitmq.exchange.${exchangeTitle}`,
            );
            const queueName = this.configService.getOrThrow(
                `rabbitmq.queue.${exchangeTitle}`,
            );
            await channel.assertExchange(exchangeName, exchangeConfig.type, {
                durable: exchangeConfig.durability,
            });
            await channel.assertQueue(queueName, {
                durable: exchangeConfig.durability,
            });
            await channel.bindQueue(queueName, exchangeName, '');
        }
        this.channel = channel;
    }

    sendMessage(exchange: RabbitmqExchanges, message: PlainRecord): void {
        this.channel.publish(
            this.configService.getOrThrow(`rabbitmq.exchange.${exchange}`), // @todo: fix this
            '',
            Buffer.from(JSON.stringify(message)),
            { persistent: true },
        );
    }
}
