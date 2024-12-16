import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('rabbitmq', () => {
    return {
        host: env.RABBITMQ_HOST,
        port: env.RABBITMQ_PORT,
        exchange: {
            notifications: env.RABBITMQ_NOTIFICATIONS_EXCHANGE,
        },
        queue: {
            notifications: env.RABBITMQ_NOTIFICATIONS_QUEUE,
        },
    };
});
