import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { CacheProvider } from '../providers/cache/index';
import { CacheTemplate } from '../providers/cache/templates';

export class MaxLoginAttempts implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { body } = context.switchToHttp().getRequest();

        const data = await CacheProvider.build({
            template: CacheTemplate.API_LOGIN_ATTEMPTS,
            identifier: body.memberId,
        }).find();
        const attemptsCount = Number.parseInt(data);

        if (
            !Number.isNaN(attemptsCount) &&
            attemptsCount >= +process.env.MAX_LOGIN_ATTEMPTS
        ) {
            throw new TooManyRequestsException();
        }
        return true;
    }
}
