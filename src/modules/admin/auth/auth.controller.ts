import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Router } from '../../../common/providers/router/index';

const router = Router.build('admin', 'auth');

@ApiTags('Auth')
@Controller(router.controller())
export class AuthController {
    @Post(router.method('login'))
    async signUp() {
        return { one: 1 };
    }
}
