import { Repository } from 'typeorm';
import {
    CityEntity,
    UserEntity,
    UserInfoEntity,
    UserTokenEntity,
    CurrencyCategoryEntity,
    CurrencyEntity,
    WalletEntity,
    UserLogEntity,
    UserCodeEntity,
    PayeeEntity,
    TransferEntity,
    ClientEntity,
    AdminEntity,
    AdminLogEntity,
    RoleEntity,
    AdminTokenEntity,
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
const userCodeRepository: Repository<UserCodeEntity> =
    appDataSource.getRepository(UserCodeEntity);
const currencyCategoryRepository: Repository<CurrencyCategoryEntity> =
    appDataSource.getRepository(CurrencyCategoryEntity);
const currencyRepository: Repository<CurrencyEntity> =
    appDataSource.getRepository(CurrencyEntity);
const walletRepository: Repository<WalletEntity> =
    appDataSource.getRepository(WalletEntity);
const payeeRepository: Repository<PayeeEntity> =
    appDataSource.getRepository(PayeeEntity);
const transferRepository: Repository<TransferEntity> =
    appDataSource.getRepository(TransferEntity);
const clientRepository: Repository<ClientEntity> =
    appDataSource.getRepository(ClientEntity);
const adminRepository: Repository<AdminEntity> =
    appDataSource.getRepository(AdminEntity);
const adminLogRepository: Repository<AdminLogEntity> =
    appDataSource.getRepository(AdminLogEntity);
const roleRepository: Repository<RoleEntity> =
    appDataSource.getRepository(RoleEntity);
const adminTokenRepository: Repository<AdminTokenEntity> =
    appDataSource.getRepository(AdminTokenEntity);

export {
    cityRepository,
    userRepository,
    userInfoRepository,
    userTokenRepository,
    userLogRepository,
    userCodeRepository,
    currencyCategoryRepository,
    currencyRepository,
    walletRepository,
    payeeRepository,
    transferRepository,
    clientRepository,
    adminRepository,
    adminLogRepository,
    roleRepository,
    adminTokenRepository,
};
