import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleServiceRepository } from './role.repository';
import { JwtAdminStrategy } from 'src/common/strategies/jwt-admin.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [JwtModule.register({})],
    controllers: [RoleController],
    providers: [RoleService, RoleServiceRepository, JwtAdminStrategy],
})
export class RoleModule {}
