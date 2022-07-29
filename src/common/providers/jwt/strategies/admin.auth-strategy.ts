import { strictEqual as equal } from 'assert';
import { AuthStrategy } from 'src/common/interfaces';
import { AdminEntity } from '../../../../db/entities';
import { adminRepository } from 'src/db/repositories';
import { PlainRecord } from 'src/common/types/other.type';
import { AdminStatus } from 'src/common/enums';

const { env } = process;

export class AdminAuthStrategy implements AuthStrategy<AdminEntity> {
    constructor(public readonly secretKey: string = env.ADMIN_JWT_SECRET) {}

    validate(admin: AdminEntity): void | never {
        const [adminTokenRecord] = admin.tokens;
        equal(adminTokenRecord.expireAt > new Date(), true);
        equal(admin.status !== AdminStatus.BLOCKED, true);
    }

    getTokenInstance({ adminId, code }: PlainRecord): Promise<AdminEntity> {
        return adminRepository
            .createQueryBuilder('admin')
            .leftJoinAndSelect('admin.tokens', 'adminToken')
            .leftJoinAndSelect('admin.roles', 'adminRoles')
            .where('admin.id = :adminId', { adminId })
            .andWhere('adminToken.serverCode = :code', { code })
            .select([
                'admin.id',
                'adminToken.expireAt',
                'adminToken.clientCode',
                'adminRoles.id',
                'adminRoles.name',
            ])
            .getOne();
    }
}
