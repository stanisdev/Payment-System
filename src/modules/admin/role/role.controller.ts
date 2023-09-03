import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Router } from '../../../common/providers/router';
import { AuthAdmin } from '../../../common/decorators/auth/admin.decorator';
import { RoleData } from 'src/common/types/admin.type';
import { Pagination } from 'src/common/types/other.type';
import { ParsePagination } from 'src/common/decorators/parse-pagination.decorator';

const router = Router.build('admin', 'role');

@ApiTags('Role')
@Controller(router.controller())
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get(router.index())
    @AuthAdmin('admin')
    @HttpCode(HttpStatus.OK)
    list(@ParsePagination() pagination: Pagination): Promise<RoleData[]> {
        return this.roleService.list(pagination);
    }
}
