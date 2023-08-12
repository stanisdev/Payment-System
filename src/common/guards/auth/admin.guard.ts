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

            authStrategy.validateDecryptedData(decryptedData);

            const adminRecord = await authStrategy.getTokenInstance(decryptedData);
            authStrategy.checkAdmission(adminRecord);

            const [adminTokenRecord] = adminRecord.tokens;
            const isClientTokenValid = await bcrypt.compare(
                adminTokenRecord.clientCode + salt,
                hash,
            );
            equal(isClientTokenValid, true);

            request.admin = adminRecord;
        } catch {
            return false;
        }
        return true;
    }
}
