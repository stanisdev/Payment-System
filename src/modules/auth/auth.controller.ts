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
import { SignInResponse, EmptyObject } from '../../common/types';
import { DoesEmailExistPipe } from '../../common/pipes/does-email-exist.pipe';
import { MaxLoginAttempts } from 'src/common/guards/max-login-attempts.guard.ts';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';

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
    ): Promise<SignInResponse[]> {
        return this.authService.login(loginDto, ip);
    }
}
