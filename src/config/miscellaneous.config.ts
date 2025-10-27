import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('miscellaneous', () => {
    return {
        ['email-confirm-code-length']: env.EMAIL_CONFIRM_CODE_LENGTH,
        ['admin-salt-length']: env.ADMIN_AUTH_SALT_LENGTH,
    };
});
