import { strictEqual as equal } from 'assert';
import { AuthStrategy } from 'src/common/interfaces';
import { AdminEntity } from '../../../../db/entities';
import { adminRepository, adminTokenRepository } from 'src/db/repositories';
import { PlainRecord } from 'src/common/types/other.type';
import { AdminStatus } from 'src/common/enums';

const { env } = process;

export class AdminAuthStrategy implements AuthStrategy<AdminEntity> {
    constructor(public readonly secretKey: string = env.ADMIN_JWT_SECRET) {}

    checkAdmission(adminRecord: AdminEntity): void | never {
        const [adminTokenRecord] = adminRecord.tokens;
        equal(adminTokenRecord.expireAt > new Date(), true);
        equal(adminRecord.status !== AdminStatus.BLOCKED, true);
    }

    validateDecryptedData(decryptedData: PlainRecord): void | never {
        const { code, adminId } = decryptedData;

        equal(Number.isInteger(adminId), true);
        equal(<number>adminId > 0, true);
        equal(typeof code, 'string');
    }

    getTokenInstance(searchCriteria: PlainRecord): Promise<AdminEntity> {
        const code = <string>searchCriteria.code;
        const adminId = <number>searchCriteria.adminId;

        return adminRepository
            .createQueryBuilder('admin')
            .leftJoinAndSelect('admin.tokens', 'adminToken')
            .leftJoinAndSelect('admin.roles', 'adminRoles')
            .where('admin.id = :adminId', { adminId })
            .andWhere('adminToken.serverCode = :code', { code })
            .select([
                'admin.id',
                'adminToken.id',
                'adminToken.expireAt',
                'adminToken.clientCode',
                'adminRoles.id',
                'adminRoles.name',
            ])
            .getOne();
    }

    static async removeAccessTokenById(id: number): Promise<void> {
        await adminTokenRepository
            .createQueryBuilder()
            .delete()
            .where('id = :id', { id })
            .execute();
    }
}
