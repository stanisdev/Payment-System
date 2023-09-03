import { Injectable } from '@nestjs/common';
import { RoleServiceRepository } from './role.repository';
import { RoleData } from 'src/common/types/admin.type';
import { Pagination } from 'src/common/types/other.type';

@Injectable()
export class RoleService {
    constructor(private readonly repository: RoleServiceRepository) {}

    /**
     * Get list of roles
     */
    async list({ limit, offset }: Pagination): Promise<RoleData[]> {
        const roles = await this.repository.getRoles(limit, offset);
        return Promise.all(
            roles.map(async (role) => {
                return {
                    ...role,
                    ...{
                        membersCount: await this.repository.countRoleMembers(
                            role.id,
                        ),
                    },
                };
            }),
        );
    }
}
