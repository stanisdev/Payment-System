import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { pick } from 'lodash';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserInfoResponse } from 'src/common/types';
import { UserEntity } from 'src/db/entities';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    me(@User() user: UserEntity): UserInfoResponse {
        return pick(user, ['id', 'memberId', 'email', 'status', 'createdAt']);
    }
}
