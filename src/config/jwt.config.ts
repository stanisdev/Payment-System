import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('jwt', () => {
    return {
        ['access-lifetime']: env.JWT_ACCESS_LIFETIME,
        ['refresh-lifetime']: env.JWT_REFRESH_LIFETIME,
        ['api-secret']: env.API_JWT_SECRET,
        ['admin-secret']: env.ADMIN_JWT_SECRET,
    };
});
