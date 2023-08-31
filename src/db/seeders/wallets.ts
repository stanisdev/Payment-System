import { payees } from '../seeders/payees';
import { transfers } from '../seeders/transfers';

export const wallets = [
    {
        id: 1,
        userId: 1,
        currencyId: 1, // U.S. Dollar
        balance: 0,
        identifier: 75350321,
        transferSender: transfers[0],
    },
    {
        id: 2,
        userId: 1,
        currencyId: 2, // Euro
        balance: 0,
        identifier: 90413830
    },
    {
        id: 3,
        userId: 1,
        currencyId: 2, // Gold
        balance: 0,
        identifier: 42588655
    },
    {
        id: 4,
        userId: 2,
        currencyId: 1,
        balance: 0,
        identifier: 60550421,
        payeeReceiver: payees[0],
        transferReceiver: transfers[0],
    },
    {
        id: 5,
        userId: 2,
        currencyId: 2,
        balance: 0,
        identifier: 11843820
    },
    {
        id: 6,
        userId: 2,
        currencyId: 2,
        balance: 0,
        identifier: 59217601
    },
];
