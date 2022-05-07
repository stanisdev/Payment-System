import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthServiceRepository, ConfigService],
})
export class AuthModule {}
