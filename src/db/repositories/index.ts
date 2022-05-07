import { Repository } from 'typeorm';
import {
    CityEntity,
    UserEntity,
    UserInfoEntity,
    UserTokenEntity,
} from '../entities';
import { appDataSource } from '../dataSource';

const cityRepository: Repository<CityEntity> =
    appDataSource.getRepository(CityEntity);
const userRepository: Repository<UserEntity> =
    appDataSource.getRepository(UserEntity);
const userInfoRepository: Repository<UserInfoEntity> =
    appDataSource.getRepository(UserInfoEntity);
const userTokenRepository: Repository<UserTokenEntity> =
    appDataSource.getRepository(UserTokenEntity);

export {
    cityRepository,
    userRepository,
    userInfoRepository,
    userTokenRepository,
};
