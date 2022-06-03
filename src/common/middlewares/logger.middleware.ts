import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../helpers/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger: Logger = Logger.getInstance();

    use(req: Request, res: Response, next: NextFunction) {
        let data: { [key: string]: string } = {
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
