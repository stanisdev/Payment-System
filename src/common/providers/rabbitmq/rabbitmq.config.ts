export enum RabbitmqExchanges {
    Notifications = 'notifications',
}

export const rabbitmqExchangesConfig = {
    [RabbitmqExchanges.Notifications]: {
        type: 'fanout',
        durability: true,
    },
};
