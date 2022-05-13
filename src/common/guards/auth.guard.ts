import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserTokenType } from '../enums';
import { Jwt } from '../jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const [, token] = request.headers.authorization.split(' ');
            const data = await Jwt.verify(token);
            const userToken = await Jwt.findInDb(data);
            const validationOptions = {
                token: userToken,
                type: UserTokenType.ACCESS,
                data,
            };
            Jwt.validate(validationOptions);

            request.user = userToken.user;
        } catch {
            throw new ForbiddenException();
        }
        return true;
    }
}
