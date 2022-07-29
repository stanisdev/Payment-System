import * as bcrypt from 'bcrypt';
import { strictEqual as equal } from 'assert';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Jwt } from 'src/common/providers/jwt/index';
import { AdminAuthStrategy } from 'src/common/providers/jwt/strategies/admin.auth-strategy';

@Injectable()
export class AuthAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const { hash, salt, authorization } = request.headers;
            const [, encryptedToken] = authorization.split(' ');

            const jwtInstance = new Jwt(new AdminAuthStrategy());
            const decryptedData = await jwtInstance.verify(encryptedToken);
            const authStrategy = jwtInstance.getStrategy();

            const admin = await authStrategy.getTokenInstance(decryptedData);
            authStrategy.validate(admin);

            const [adminTokenRecord] = admin.tokens;
            const isClientTokenValid = await bcrypt.compare(
                adminTokenRecord.clientCode + salt,
                hash,
            );
            equal(isClientTokenValid, true);

            request.admin = admin;
        } catch {
            return false;
        }
        return true;
    }
}
