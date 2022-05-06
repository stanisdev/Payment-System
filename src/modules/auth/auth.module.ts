import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthServiceRepository],
})
export class AuthModule {}
