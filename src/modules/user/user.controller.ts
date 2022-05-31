import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { pick } from 'lodash';
import { User } from '../../common/decorators/user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserInfoResponse } from '../../common/types/user.type';
import { UserEntity } from '../../db/entities';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    me(@User() user: UserEntity): UserInfoResponse {
        return pick(user, ['id', 'memberId', 'email', 'status', 'createdAt']);
    }
}
