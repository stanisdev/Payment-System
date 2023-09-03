import * as bcrypt from 'bcrypt';
import * as i18next from 'i18next';
import { strictEqual as equal } from 'assert';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Jwt } from 'src/common/providers/jwt/index';
import { AdminAuthStrategy } from 'src/common/providers/jwt/strategies/admin.auth-strategy';

@Injectable()
export class AuthAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            /**
             * Get headers and use surface validation
             */
            const { hash, salt, authorization } = request.headers;
            const [attribute, encryptedToken] = authorization.split(' ');
            equal(attribute, 'Bearer');
            equal(salt.length, +process.env.ADMIN_AUTH_SALT_LENGTH);

            /**
             * Validate JWT
             */
            const jwtInstance = new Jwt(new AdminAuthStrategy());
            const decryptedData = await jwtInstance.verify(encryptedToken);
            const authStrategy = jwtInstance.getStrategy();

            authStrategy.validateDecryptedData(decryptedData);
            const adminRecord = await authStrategy.getTokenInstance(
                decryptedData,
            );
            const [adminTokenRecord] = adminRecord.tokens;

            try {
                /**
                 * If the given token has expired or related with
                 * a blocked admin delete the token
                 */
                authStrategy.checkAdmission(adminRecord);
            } catch {
                await AdminAuthStrategy.removeAccessTokenById(
                    adminTokenRecord.id,
                );
                throw new Error(
                    i18next.t('admin.access-token-expired-or-admin-is-blocked'),
                );
            }

            /**
             * Check client token. The server expects a hash generated
             * by joining a 'client code' with a salt
             */
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
