import * as bcrypt from 'bcrypt';
import { strictEqual as equal } from 'assert';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminStatus, JwtSecretKey } from '../../../common/enums';
import { Jwt } from '../../../common/providers/jwt';
import { adminRepository } from '../../../db/repositories';
import { AdminEntity } from '../../../db/entities';

@Injectable()
export class AuthAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const { hash, salt, authorization } = request.headers;
            const [, token] = authorization.split(' ');
            const { adminId, code: serverCode } = await Jwt.verify(
                token,
                JwtSecretKey.ADMIN,
            );
            /**
             * Find an admin record with the related metadata
             */
            const admin = await adminRepository
                .createQueryBuilder('admin')
                .leftJoinAndSelect('admin.tokens', 'adminToken')
                .leftJoinAndSelect('admin.roles', 'adminRoles')
                .where('admin.id = :adminId', { adminId })
                .andWhere('adminToken.serverCode = :serverCode', { serverCode })
                .select([
                    'admin.id',
                    'adminToken.expireAt',
                    'adminToken.clientCode',
                    'adminRoles.id',
                    'adminRoles.name',
                ])
                .getOne();
            equal(admin instanceof AdminEntity, true);

            const [adminTokenRecord] = admin.tokens;
            const match = await bcrypt.compare(
                adminTokenRecord.clientCode + salt,
                hash,
            );
            equal(match, true);
            equal(adminTokenRecord.expireAt > new Date(), true);
            equal(admin.status !== AdminStatus.BLOCKED, true);

            request.admin = admin;
        } catch {
            return false;
        }
        return true;
    }
}
