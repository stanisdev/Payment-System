import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../../common/decorators/user.decorator';
import { AuthApi } from '../../../common/decorators/auth/api.decorator';
import { Router } from '../../../common/providers/router/index';
import { UserEntity } from '../../../db/entities';
import { UserService } from './user.service';
import { UserPayloadDto } from './dto/payload/user-payload.dto';

const router = Router.build('api', 'user');

@ApiTags('User')
@AuthApi()
@Controller(router.controller())
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(router.method('me'))
    @ApiOkResponse({
        type: UserPayloadDto,
        description: 'Current user information',
    })
    me(@User() user: UserEntity): Promise<UserPayloadDto> {
        return this.userService.getFullInfo(user);
    }
}
