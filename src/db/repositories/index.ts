import { Repository } from 'typeorm';
import { CityEntity, UserEntity, UserInfoEntity } from '../entities';
import { appDataSource } from '../dataSource';

const cityRepository: Repository<CityEntity> =
    appDataSource.getRepository(CityEntity);
const userRepository: Repository<UserEntity> =
    appDataSource.getRepository(UserEntity);
const userInfoRepository: Repository<UserInfoEntity> =
    appDataSource.getRepository(UserInfoEntity);

export { cityRepository, userRepository, userInfoRepository };
