import { strictEqual as equal } from 'assert';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserTokenType } from 'src/common/enums';
import { Jwt } from 'src/common/providers/jwt/index';
import { ApiAuthStrategy } from '../../../common/providers/jwt/strategies/api.auth-strategy';

@Injectable()
export class AuthApiGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const jwtInstance = new Jwt(new ApiAuthStrategy(UserTokenType.ACCESS));
        try {
            const [attribute, encryptedToken] = request.headers.authorization.split(' ');
            equal(attribute, 'Bearer');
            const decryptedData = await jwtInstance.verify(encryptedToken);
            const authStrategy = jwtInstance.getStrategy();

            const accessToken = await authStrategy.getTokenInstance(
                decryptedData,
            );
            authStrategy.validate(accessToken);
            request.user = accessToken.user;
        } catch {
            return false;
        }
        return true;
    }
}
