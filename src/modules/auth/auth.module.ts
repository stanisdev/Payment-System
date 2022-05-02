import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';
import { CityEntity, UserEntity, UserInfoEntity } from '../../db/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([CityEntity, UserEntity, UserInfoEntity]),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthServiceRepository],
})
export class AuthModule {}
