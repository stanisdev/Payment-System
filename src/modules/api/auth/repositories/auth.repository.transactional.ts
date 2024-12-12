import {
    PrimaryUserInfo,
    UserCodeData,
    UserInfoData,
} from 'src/common/types/user.type';
import {
    CityEntity,
    UserCodeEntity,
    UserEntity,
    UserInfoEntity,
} from 'src/db/entities';
import { cityRepository } from 'src/db/repositories';
import { EntityManager } from 'typeorm';

export class AuthTransactionalRepository {
    constructor(private transactionalEntityManager: EntityManager) {}

    async createUser(params: PrimaryUserInfo): Promise<UserEntity> {
        const user = new UserEntity();
        user.setPrimaryInfo(params);

        await this.transactionalEntityManager.save(user);
        return user;
    }

    async createCity(name: string): Promise<CityEntity> {
        let city = await cityRepository.findOneBy({
            name,
        });
        if (!(city instanceof Object)) {
            city = new CityEntity();
            city.name = name;
            await this.transactionalEntityManager.save(city);
        }
        return city;
    }

    async createUserInfo(data: UserInfoData): Promise<void> {
        await this.transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(UserInfoEntity)
            .values(data)
            .execute();
    }

    async createUserCode({
        user,
        code,
        action,
        expireAt,
    }: UserCodeData): Promise<void> {
        await this.transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(UserCodeEntity)
            .values({
                user,
                code,
                action,
                expireAt,
            })
            .execute();
    }
}
