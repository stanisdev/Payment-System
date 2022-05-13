import { BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as i18next from 'i18next';

export function getJwtTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { headers } = req;
        const [, token] = headers.authorization.split(' ');
        headers.accessToken = token;
    } catch {
        throw new BadRequestException(i18next.t('no-access-token'));
    }
    next();
}
