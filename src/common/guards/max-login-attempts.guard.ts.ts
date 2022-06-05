import { CanActivate, ExecutionContext } from '@nestjs/common';
import { redisClient } from '../providers/redis';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';

export class MaxLoginAttempts implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { memberId } = request.body;
        const data = await redisClient.get(`memberId:${memberId}`);
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
