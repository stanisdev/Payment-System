const { env } = process;

export const modules = {
    api: env.API_PREFIX,
    admin: env.ADMIN_PREFIX,
};

export const routes = {
    api: {
        auth: {
            'sign-up': 'sign-up',
            login: 'login',
            'confirm-email': 'confirm-email/:code',
            'update-token': 'update-token',
            logout: 'logout',
            'restore-password:initiate': 'restore-password-initiate',
            'restore-password:confirm-code': 'restore-password-confirm-code',
            'restore-password:complete': 'restore-password-complete',
        },
        wallet: {},
        payee: {},
        currency: {},
        transfer: {
            internal: 'internal',
            withdrawal: 'withdrawal',
            replenishment: 'replenishment',
            refund: 'refund',
            'invoice:create': 'invoice-create',
            'invoice:pay': 'invoice-pay',
        },
        user: {
            me: 'me',
        },
    },
    admin: {
        auth: {
            login: 'login',
        },
        role: {},
    },
};
