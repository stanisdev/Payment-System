import { Injectable, LoggerService } from '@nestjs/common';
import { pino as getPino } from 'pino';

const pino = getPino({
    enabled: process.env.NODE_ENV != 'test',
});

@Injectable()
export class LoggerProvider implements LoggerService {
    /**
     * Write a 'log' level log.
     */
    log(message: any) {
        pino.info(message);
    }

    /**
     * Write an 'error' level log.
     */
    error(message: any) {
        pino.error(message);
    }

    /**
     * Write a 'warn' level log.
     */
    warn(message: any) {
        pino.warn(message);
    }

    /**
     * Write a 'debug' level log.
     */
    debug(message: any) {
        pino.debug(message);
    }
}
