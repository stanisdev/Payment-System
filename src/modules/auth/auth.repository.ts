import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityEntity, UserEntity, UserInfoEntity } from '../../db/entities';
import { BasicUserData, UserInfoData } from '../../common/types';

@Injectable()
export class AuthServiceRepository {
    constructor(
        @InjectRepository(CityEntity)
        private readonly cityRepository: Repository<CityEntity>,

        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,

        @InjectRepository(UserInfoEntity)
        private readonly userInfoRepository: Repository<UserInfoEntity>,
    ) {}

    async createUser(data: BasicUserData): Promise<UserEntity> {
        const user = new UserEntity();
        user.memberId = data.memberId;
        user.email = data.email;
        user.password = data.password;
        user.status = data.status;

        await this.userRepository.save(user);
        return user;
    }

    async createCity(name: string): Promise<CityEntity> {
        let city = await this.cityRepository.findOneBy({
            name,
        });
        if (!(city instanceof Object)) {
            city = new CityEntity();
            city.name = name;
            await this.cityRepository.save(city);
        }
        return city;
    }

    async createUserInfo(data: UserInfoData): Promise<void> {
        const userInfo = new UserInfoEntity();
        userInfo.accountName = data.accountName;
        userInfo.city = data.city;
        userInfo.user = data.user;
        userInfo.fullName = data.fullName;
        userInfo.country = data.country;
        userInfo.address = data.address;
        userInfo.phone = data.phone;
        userInfo.zipCode = data.zipCode;
        userInfo.accountType = data.accountType;

        await this.userInfoRepository.save(userInfo);
    }
}
