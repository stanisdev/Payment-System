import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';
import { CacheModule } from 'src/common/providers/cache/cache.module';

@Module({
    imports: [CacheModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, AuthServiceRepository, ConfigService],
})
export class AuthModule {}
