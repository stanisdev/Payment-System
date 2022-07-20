import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthAdminGuard } from '../../guards/auth/admin.guard';

export const AuthAdmin = (...roles: string[]) => {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(AuthAdminGuard, RolesGuard),
        ApiBearerAuth(),
    );
};
