import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('restrictions', () => {
    return {
        ['max-login-attempts']: env.MAX_LOGIN_ATTEMPTS,
        ['restore-password-complete-code-expiration']:
            env.RESTORE_PASSWORD_COMPLETE_CODE_EXPIRATION,
        ['confirm-email-expiration']: env.CONFIRM_EMAIL_EXPIRATION,
        ['refund-allowed-period']: env.REFUND_ALLOWED_PERIOD,
        ['max-wallets-per-user']: env.MAX_WALLETS_PER_USER,
    };
});
