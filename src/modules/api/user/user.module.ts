import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserServiceRepository } from './user.repository';
import { JwtApiStrategy } from 'src/common/strategies/jwt-api.strategy';

@Module({
    controllers: [UserController],
    providers: [UserService, UserServiceRepository, JwtApiStrategy],
})
export class UserModule {}
