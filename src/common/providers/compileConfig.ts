import * as dotenv from 'dotenv';

const { env } = process;

export const compileConfig = () => {
    if (typeof env.NODE_ENV != 'string') {
        env.NODE_ENV = 'development';
    }
    dotenv.config({
        path: `.${env.NODE_ENV}.env`,
    });
};
