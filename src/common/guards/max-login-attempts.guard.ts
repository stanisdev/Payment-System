import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { CacheProvider } from '../providers/cache/cache.provider';
import { CacheTemplate } from '../providers/cache/cache.template';

export class MaxLoginAttempts implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { body } = context.switchToHttp().getRequest();

        const cachedValue = await new CacheProvider()
            .buildManager({
                template: CacheTemplate.API_LOGIN_ATTEMPTS,
                identifier: body.memberId,
            })
            .find();
        const attemptsCount = Number.parseInt(cachedValue);

        if (
            !Number.isNaN(attemptsCount) &&
            attemptsCount >= +process.env.MAX_LOGIN_ATTEMPTS
        ) {
            throw new TooManyRequestsException();
        }
        return true;
    }
}
