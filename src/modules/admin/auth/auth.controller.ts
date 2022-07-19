import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthResponse } from 'src/common/types/admin.type';
import { Router } from '../../../common/providers/router/index';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

const router = Router.build('admin', 'auth');

@ApiTags('Auth')
@Controller(router.controller())
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post(router.method('login'))
    @HttpCode(HttpStatus.OK)
    async signUp(@Body() dto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(dto);
    }
}
