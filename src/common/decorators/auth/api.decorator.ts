import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthApiGuard } from '../../../common/guards/auth/api.guard';

export const AuthApi = () => {
    return applyDecorators(UseGuards(AuthApiGuard), ApiBearerAuth());
};
