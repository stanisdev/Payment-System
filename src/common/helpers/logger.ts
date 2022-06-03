import { LoggerService } from '@nestjs/common';
import { pino as getPino } from 'pino';

const pino = getPino();

export class Logger implements LoggerService {
    private static instance: Logger | null = null;
    private constructor() {}

    /**
     * Get an instance of the class
     */
    static getInstance(): Logger {
        if (!(Logger.instance instanceof Logger)) {
            return (Logger.instance = new Logger());
        }
        return Logger.instance;
    }

    /**
     * Write a 'log' level log.
     */
    log(message: any, ...optionalParams: any[]) {
        pino.info(message);
    }

    /**
     * Write an 'error' level log.
     */
    error(message: any, ...optionalParams: any[]) {
        pino.error(message);
    }

    /**
     * Write a 'warn' level log.
     */
    warn(message: any, ...optionalParams: any[]) {
        pino.warn(message);
    }

    /**
     * Write a 'debug' level log.
     */
    debug(message: any, ...optionalParams: any[]) {
        pino.debug(message);
    }
}
