import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { strictEqual as equal } from 'assert';
import { userTokenRepository } from 'src/db/repositories';
import { UserTokenType } from '../enums';
import { Jwt } from '../jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const [, token] = request.headers.authorization.split(' ');
            const data = await Jwt.verify(token);

            const userToken = await userTokenRepository
                .createQueryBuilder('userToken')
                .leftJoinAndSelect('userToken.user', 'user')
                .where('userToken.userId = :userId', data)
                .andWhere('userToken.code = :code', data)
                .getOne();

            const { user } = userToken;
            equal(userToken.type, UserTokenType.ACCESS);
            equal(userToken.expireAt > new Date(), true);
            equal(user.id, data.userId);
            equal(user.status > 0, true);

            request.user = user;
        } catch {
            throw new ForbiddenException();
        }
        return true;
    }
}
