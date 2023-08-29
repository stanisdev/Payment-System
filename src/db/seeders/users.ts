import { wallets } from './wallets';

export const users = [
    {
        id: 1,
        memberId: 4281037,
        email: 'one@mailbox.cloud',
        password: 'UOW7HZK831',
        salt: 'g8T3d',
        status: 1,
        createdAt: new Date(),
        wallets: wallets.slice(0, 3),
    },
];
