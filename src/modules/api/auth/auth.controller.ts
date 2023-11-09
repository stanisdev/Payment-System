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
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmptyObject } from '../../../common/types/other.type';
import { DoesEmailExistPipe } from '../../../common/pipes/does-email-exist.pipe';
import { MaxLoginAttempts } from '../../../common/guards/max-login-attempts.guard';
import { Router } from '../../../common/providers/router/index';
import { AuthService } from './auth.service';
import {
    RestorePasswordCompleteDto,
    RestorePasswordConfirmCodeDto,
    RestorePasswordInitiateDto,
    SignUpDto,
    UpdateTokenDto,
    LoginDto,
} from './dto';
import { LoginPayloadDto } from './dto/payload/login-payload.dto';
import { UserPayloadDto } from '../user/dto/payload/user-payload.dto';
import { RestorePasswordCompleteCodeDto } from './dto/payload/restore-password-complete-code.dto';

const router = Router.build('api', 'auth');

@ApiTags('Auth')
@Controller(router.controller())
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post(router.method('sign-up'))
    @UsePipes(DoesEmailExistPipe)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({
        description: 'New user registration',
        type: UserPayloadDto,
    })
    async signUp(@Body() signUpDto: SignUpDto): Promise<UserPayloadDto> {
        return this.authService.signUp(signUpDto);
    }

    @Post(router.method('login'))
    @UseGuards(MaxLoginAttempts)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Access and Refresh tokens',
        type: [LoginPayloadDto],
    })
    async login(
        @Body() loginDto: LoginDto,
        @Ip() ip: string,
    ): Promise<LoginPayloadDto[]> {
        return this.authService.login(loginDto, ip);
    }

    @Get(router.method('confirm-email'))
    @HttpCode(HttpStatus.OK)
    @ApiParam({
        name: 'code',
        description: 'The code to confirm user email',
    })
    async confirmEmail(@Param('code') code: string): Promise<EmptyObject> {
        await this.authService.confirmEmail(code);
        return {};
    }

    @Post(router.method('update-token'))
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'New Access and Refresh tokens',
        type: [LoginPayloadDto],
    })
    async updateToken(
        @Body() { refreshToken }: UpdateTokenDto,
    ): Promise<LoginPayloadDto[]> {
        return this.authService.updateToken(refreshToken);
    }

    @Get(router.method('logout'))
    @HttpCode(HttpStatus.OK)
    @ApiQuery({
        type: Boolean,
        name: 'allDevices',
        description: 'If user wants to log out on all the devices',
    })
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
    @ApiOkResponse({
        description:
            'The code to complete the process of restoring user password',
        type: RestorePasswordCompleteCodeDto,
    })
    async restorePasswordConfirmCode(
        @Body() dto: RestorePasswordConfirmCodeDto,
    ): Promise<RestorePasswordCompleteCodeDto> {
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
