import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserServiceRepository } from './user.repository';

@Module({
    controllers: [UserController],
    providers: [UserService, UserServiceRepository],
})
export class UserModule {}
