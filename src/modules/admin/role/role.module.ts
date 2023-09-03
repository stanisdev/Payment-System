import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleServiceRepository } from './role.repository';

@Module({
    controllers: [RoleController],
    providers: [RoleService, RoleServiceRepository],
})
export class RoleModule {}
