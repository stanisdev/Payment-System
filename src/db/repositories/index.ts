import { Repository } from 'typeorm';
import {
    CityEntity,
    UserEntity,
    UserInfoEntity,
    UserTokenEntity,
    WalletCategoryEntity,
    WalletTypeEntity,
    WalletEntity,
    UserLogEntity,
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
const userLogRepository: Repository<UserLogEntity> =
    appDataSource.getRepository(UserLogEntity);
const walletCategoryRepository: Repository<WalletCategoryEntity> =
    appDataSource.getRepository(WalletCategoryEntity);
const walletTypeRepository: Repository<WalletTypeEntity> =
    appDataSource.getRepository(WalletTypeEntity);
const walletRepository: Repository<WalletEntity> =
    appDataSource.getRepository(WalletEntity);

export {
    cityRepository,
    userRepository,
    userInfoRepository,
    userTokenRepository,
    userLogRepository,
    walletCategoryRepository,
    walletTypeRepository,
    walletRepository,
};
