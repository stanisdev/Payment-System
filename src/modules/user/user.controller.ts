import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { pick } from 'lodash';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserInfoResponse } from 'src/common/types';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    me(@Req() request): UserInfoResponse {
        return pick(request.user, [
            'id',
            'memberId',
            'email',
            'status',
            'createdAt',
        ]);
    }
}
