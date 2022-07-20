import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Router } from '../../../common/providers/router';
import { AuthAdmin } from '../../../common/decorators/auth/admin.decorator';

const router = Router.build('admin', 'role');

@ApiTags('Role')
@Controller(router.controller())
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get(router.index())
    @AuthAdmin('admin')
    @HttpCode(HttpStatus.OK)
    list(): Promise<void> {
        return this.roleService.list();
    }
}
