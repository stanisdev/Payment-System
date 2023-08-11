import * as dotenv from 'dotenv';

const { env } = process;

export const compileConfig = () => {
    let path = '.env';

    if (typeof env.NODE_ENV == 'string' && env.NODE_ENV != 'production') {
        path = `.${env.NODE_ENV}.env`;
    }
    dotenv.config({
        path,
    });
};
