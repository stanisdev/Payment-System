import { Injectable } from '@nestjs/common';
import { AdminEntity } from 'src/db/entities';
import { adminRepository, adminTokenRepository } from 'src/db/repositories';
import { AdminData, AdminTokenData } from '../../../common/types/admin.type';

@Injectable()
export class AuthServiceRepository {
    async updateAdmin(id: number, data: AdminData): Promise<void> {
        await adminRepository
            .createQueryBuilder()
            .update()
            .set(data)
            .where('id = :id', { id })
            .execute();
    }

    async createToken(data: AdminTokenData): Promise<void> {
        await adminTokenRepository
            .createQueryBuilder()
            .insert()
            .values(data)
            .execute();
    }
}
