import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityEntity, UserEntity, UserInfoEntity } from '../../db/entities';

@Injectable()
export class AuthServiceRepository {
    constructor(
        @InjectRepository(CityEntity)
        private readonly cityRepository: Repository<CityEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(UserInfoEntity)
        private readonly userInfoRepository: Repository<UserInfoEntity>,
    ) {}

    async doQuery() {
        await this.userRepository.findOneBy({
            id: 1,
        });
    }
}
