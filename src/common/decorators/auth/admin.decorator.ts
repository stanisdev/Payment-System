import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

export const AuthAdmin = (...roles: string[]) => {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(AuthGuard('jwt-admin'), RolesGuard),
        ApiBearerAuth(),
    );
};
