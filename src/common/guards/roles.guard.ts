import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminEntity, RoleEntity } from 'src/db/entities';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const admin: AdminEntity = request.admin;
        const roles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );
        return roles.every((expectedRole) => {
            return (
                admin.roles.find(
                    (appointedRole) => appointedRole.name === expectedRole,
                ) instanceof RoleEntity
            );
        });
    }
}
