import {
    userRepository,
    cityRepository,
    userInfoRepository,
    walletRepository,
} from '../repositories';

import { users } from '../seeders/users';
import { cities } from '../seeders/cities';
import { userInfo } from '../seeders/userInfo';
import { wallets } from '../seeders/wallets';
import { appDataSource } from '../dataSource';

const run = async () => {
    await appDataSource.initialize();

    await appDataSource.transaction(async (transactionalEntityManager) => {

        // Users
        const { raw: insertedUsers } = await userRepository
            .createQueryBuilder()
            .insert()
            .values(users)
            .execute();

        const usersHandled = users.map((user, index) => {
            user.id = insertedUsers[index].id;
            return user;
        });
        const walletsPrepared: typeof wallets = [];

        // Cities
        const { raw: insertedCities } = await cityRepository
            .createQueryBuilder()
            .insert()
            .values(cities)
            .execute();

        // User info
        const userInfoPrepared: typeof userInfo = userInfo
            .map((userInfo, index) => {
                userInfo.userId = insertedUsers[index].id;
                userInfo.cityId = insertedCities[0].id;
                return userInfo;
            });
        await userInfoRepository
            .createQueryBuilder()
            .insert()
            .values(userInfoPrepared)
            .execute();

        // Prepare wallets
        for (const user of usersHandled) {
            const userWallets = user.wallets.map((wallet) => {
                wallet.userId = user.id;
                return wallet;
            });
            walletsPrepared.push(...userWallets);
        }

        await walletRepository
            .createQueryBuilder()
            .insert()
            .values(walletsPrepared)
            .execute();
    });
};

run();
