import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { pick } from 'lodash';
import { User } from '../../../common/decorators/user.decorator';
import { AuthApi } from '../../../common/decorators/auth/api.decorator';
import { UserInfoResponse } from '../../../common/types/user.type';
import { Router } from '../../../common/providers/router/index';
import { UserEntity } from '../../../db/entities';
import { UserService } from './user.service';

const router = Router.build('api', 'user');

@ApiTags('User')
@AuthApi()
@Controller(router.controller())
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(router.method('me'))
    me(@User() user: UserEntity): UserInfoResponse {
        return pick(user, ['id', 'memberId', 'email', 'status', 'createdAt']);
    }
}
