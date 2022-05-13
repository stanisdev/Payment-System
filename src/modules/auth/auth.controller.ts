import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Body,
    UsePipes,
    UseGuards,
    Ip,
} from '@nestjs/common';
import { JwtCompleteData, EmptyObject } from '../../common/types';
import { DoesEmailExistPipe } from '../../common/pipes/does-email-exist.pipe';
import { MaxLoginAttempts } from 'src/common/guards/max-login-attempts.guard.ts';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/sign-up')
    @UsePipes(DoesEmailExistPipe)
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() signUpDto: SignUpDto): Promise<EmptyObject> {
        return this.authService.signUp(signUpDto);
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

    @Post('/update-token')
    @HttpCode(HttpStatus.OK)
    async updateToken(
        @Body() updateTokenDto: UpdateTokenDto,
    ): Promise<JwtCompleteData[]> {
        return this.authService.updateToken(updateTokenDto);
    }
}
