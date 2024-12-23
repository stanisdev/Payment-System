import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PlainRecord } from '../types/other.type';
import { LoggerProvider } from '../providers/logger/logger.provider';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    @Inject(LoggerProvider)
    private logger: LoggerProvider;

    use(req: Request, res: Response, next: NextFunction) {
        let data: PlainRecord = {
            method: req.method,
            url: req.baseUrl,
        };
        for (const option of ['body', 'params', 'query']) {
            if (Object.keys(req[option]).length > 0) {
                data = {
                    ...data,
                    ...{ [option]: req[option] },
                };
            }
        }
        this.logger.log(data);
        next();
    }
}
