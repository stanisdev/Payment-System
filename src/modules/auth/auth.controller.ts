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
import { ApiTags } from '@nestjs/swagger';
import { JwtCompleteData, EmptyObject } from '../../common/types';
import { DoesEmailExistPipe } from '../../common/pipes/does-email-exist.pipe';
import { MaxLoginAttempts } from '../../common/guards/max-login-attempts.guard.ts';
import { AuthService } from './auth.service';
import { Request } from 'express';
import {
    LoginDto,
    RestorePasswordCompleteDto,
    RestorePasswordConfirmCodeDto,
    RestorePasswordInitiateDto,
    SignUpDto,
    UpdateTokenDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/sign-up')
    @UsePipes(DoesEmailExistPipe)
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() signUpDto: SignUpDto): Promise<EmptyObject> {
        await this.authService.signUp(signUpDto);
        return {};
    }

    @Post('/login')
    @UseGuards(MaxLoginAttempts)
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Ip() ip: string,
    ): Promise<JwtCompleteData[]> {
        return this.authService.login(loginDto, ip);
    }

    @Get('/confirm-email/:code')
    @HttpCode(HttpStatus.OK)
    async confirmEmail(@Param('code') code: string): Promise<EmptyObject> {
        await this.authService.confirmEmail(code);
        return {};
    }

    @Post('/update-token')
    @HttpCode(HttpStatus.OK)
    async updateToken(
        @Body() updateTokenDto: UpdateTokenDto,
    ): Promise<JwtCompleteData[]> {
        return this.authService.updateToken(updateTokenDto);
    }

    @Get('/logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() { headers }: Request,
        @Query('allDevices') allDevices?: boolean,
    ): Promise<EmptyObject> {
        await this.authService.logout(
            headers.accessToken.toString(),
            Boolean(allDevices),
        );
        return {};
    }

    @Post('/restore-password-initiate')
    @HttpCode(HttpStatus.OK)
    async restorePassword(
        @Body() dto: RestorePasswordInitiateDto,
    ): Promise<EmptyObject> {
        await this.authService.restorePasswordInitiate(dto);
        return {};
    }

    @Post('/restore-password-confirm-code')
    @HttpCode(HttpStatus.OK)
    async restorePasswordConfirmCode(
        @Body() dto: RestorePasswordConfirmCodeDto,
    ): Promise<string> {
        return this.authService.restorePasswordConfirmCode(dto);
    }

    @Put('/restore-password-complete')
    @HttpCode(HttpStatus.OK)
    async restorePasswordComplete(
        @Body() dto: RestorePasswordCompleteDto,
    ): Promise<EmptyObject> {
        await this.authService.restorePasswordComplete(dto);
        return {};
    }
}
