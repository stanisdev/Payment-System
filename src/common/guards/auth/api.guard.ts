import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtSecretKey, UserTokenType } from '../../enums';
import { Jwt } from '../../providers/jwt';

@Injectable()
export class AuthApiGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const [, token] = request.headers.authorization.split(' ');
            const data = await Jwt.verify(token, JwtSecretKey.API);
            const userToken = await Jwt.findInDb(data, UserTokenType.ACCESS);
            Jwt.validate(userToken);

            request.user = userToken.user;
        } catch {
            return false;
        }
        return true;
    }
}
