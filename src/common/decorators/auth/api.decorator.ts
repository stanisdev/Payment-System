import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

export const AuthApi = () => {
    return applyDecorators(UseGuards(AuthGuard('jwt')), ApiBearerAuth());
};
