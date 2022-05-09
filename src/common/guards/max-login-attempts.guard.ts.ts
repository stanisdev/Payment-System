import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { redisClient } from '../redis';

export class MaxLoginAttempts implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { memberId } = request.body;
        const data = await redisClient.get(`memberId:${memberId}`);
        const attemptsCount = Number.parseInt(data);

        if (
            !Number.isNaN(attemptsCount) &&
            attemptsCount >= +process.env.MAX_ATTEMPTS_TO_LOGIN
        ) {
            throw new ForbiddenException(
                'You have reached maximum attempts of signing in',
            );
        }
        return true;
    }
}
