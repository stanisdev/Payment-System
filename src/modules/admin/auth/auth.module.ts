import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';
import { CacheModule } from 'src/common/providers/cache/cache.module';

@Module({
    imports: [CacheModule],
    controllers: [AuthController],
    providers: [AuthService, AuthServiceRepository, ConfigService],
})
export class AuthModule {}
