import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { pick } from 'lodash';
import { User } from '../../../common/decorators/user.decorator';
import { AuthApi } from '../../../common/decorators/auth/api.decorator';
import { Router } from '../../../common/providers/router/index';
import { UserEntity } from '../../../db/entities';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

const router = Router.build('api', 'user');

@ApiTags('User')
@AuthApi()
@Controller(router.controller())
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(router.method('me'))
    @ApiOkResponse({
        type: UserDto,
        description: 'Current user information',
    })
    me(@User() user: UserEntity): UserDto {
        return pick(user, ['id', 'memberId', 'email', 'status', 'createdAt']);
    }
}
