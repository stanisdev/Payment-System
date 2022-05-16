import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/db/entities';

export const User = createParamDecorator(function (
    data: unknown,
    ctx: ExecutionContext,
): UserEntity {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
