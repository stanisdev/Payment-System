import { wallets } from './wallets';
import { payees } from '../seeders/payees';

export const users = [
    {
        id: 1,
        memberId: 4281037,
        email: 'one@mailbox.cloud',
        password: '$2b$10$wts9Thw6JJ3QvGzBEsVv6Ocy2nm9tX3.78T0bFQFz7KDjSxbuWgXa', // UOWCHZK82931
        salt: 'g8T3d',
        status: 1,
        wallets: wallets.slice(0, 3),
        payeeOwner: payees[0],
    },
    {
        id: 2,
        memberId: 7914253,
        email: 'info@mailbox.fun',
        password: '$2b$10$wts9Thw6JJ3QvGzBEsVv6Ocy2nm9tX3.78T0bFQFz7KDjSxbuWgXa', // UOWCHZK82931
        salt: 'K2uc9',
        status: 1,
        wallets: wallets.slice(3, 6),
    }
];
