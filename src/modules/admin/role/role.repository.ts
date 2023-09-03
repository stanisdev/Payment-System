import { Injectable } from '@nestjs/common';
import { adminRepository, roleRepository } from 'src/db/repositories';

@Injectable()
export class RoleServiceRepository {
    getRoles(limit: number, offset: number) {
        return roleRepository
            .createQueryBuilder('role')
            .select(['role.id', 'role.name', 'role.createdAt'])
            .orderBy('role.id')
            .limit(limit)
            .offset(offset)
            .getMany();
    }

    async countRoleMembers(roleId: number): Promise<number> {
        return adminRepository
            .createQueryBuilder('admin')
            .leftJoinAndSelect('admin.roles', 'roles')
            .where('roles.id = :roleId', { roleId })
            .getCount();
    }
}
