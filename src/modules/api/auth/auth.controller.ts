import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Body,
    UsePipes,
    UseGuards,
    Ip,
    Get,
    Query,
    Req,
    Put,
    Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { JwtCompleteData, EmptyObject } from '../../../common/types/other.type';
import { DoesEmailExistPipe } from '../../../common/pipes/does-email-exist.pipe';
import { MaxLoginAttempts } from '../../../common/guards/max-login-attempts.guard';
import { Router } from '../../../common/providers/router/index';
import { AuthService } from './auth.service';
import {
    LoginDto,
    RestorePasswordCompleteDto,
    RestorePasswordConfirmCodeDto,
    RestorePasswordInitiateDto,
    SignUpDto,
    UpdateTokenDto,
} from './dto';

const router = Router.build('api', 'auth');

@ApiTags('Auth')
@Controller(router.controller())
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post(router.method('sign-up'))
    @UsePipes(DoesEmailExistPipe)
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() signUpDto: SignUpDto): Promise<EmptyObject> {
        await this.authService.signUp(signUpDto);
        return {};
    }

    @Post(router.method('login'))
    @UseGuards(MaxLoginAttempts)
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Ip() ip: string,
    ): Promise<JwtCompleteData[]> {
        return this.authService.login(loginDto, ip);
    }

    @Get(router.method('confirm-email'))
    @HttpCode(HttpStatus.OK)
    async confirmEmail(@Param('code') code: string): Promise<EmptyObject> {
        await this.authService.confirmEmail(code);
        return {};
    }

    @Post(router.method('update-token'))
    @HttpCode(HttpStatus.OK)
    async updateToken(
        @Body() { refreshToken }: UpdateTokenDto,
    ): Promise<JwtCompleteData[]> {
        return this.authService.updateToken(refreshToken);
    }

    @Get(router.method('logout'))
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() { headers }: Request,
        @Query('allDevices') allDevices?: boolean,
    ): Promise<EmptyObject> {
        await this.authService.logout(
            headers.authorization,
            Boolean(allDevices),
        );
        return {};
    }

    @Post(router.method('restore-password:initiate'))
    @HttpCode(HttpStatus.OK)
    async restorePassword(
        @Body() dto: RestorePasswordInitiateDto,
    ): Promise<EmptyObject> {
        await this.authService.restorePasswordInitiate(dto);
        return {};
    }

    @Post(router.method('restore-password:confirm-code'))
    @HttpCode(HttpStatus.OK)
    async restorePasswordConfirmCode(
        @Body() dto: RestorePasswordConfirmCodeDto,
    ): Promise<string> {
        return this.authService.restorePasswordConfirmCode(dto);
    }

    @Put(router.method('restore-password:complete'))
    @HttpCode(HttpStatus.OK)
    async restorePasswordComplete(
        @Body() dto: RestorePasswordCompleteDto,
    ): Promise<EmptyObject> {
        await this.authService.restorePasswordComplete(dto);
        return {};
    }
}
