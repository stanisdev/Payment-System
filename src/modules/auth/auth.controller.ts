import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Body,
    UsePipes,
} from '@nestjs/common';
import { DoesEmailExistPipe } from '../../common/pipes/does-email-exist.pipe';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/sign-up')
    @UsePipes(DoesEmailExistPipe)
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }
}
