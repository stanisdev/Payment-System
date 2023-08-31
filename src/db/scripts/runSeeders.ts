import {
    UserEntity,
    CityEntity,
    UserInfoEntity,
    WalletEntity,
    PayeeEntity,
    TransferEntity,
} from '../entities';
import { users } from '../seeders/users';
import { cities } from '../seeders/cities';
import { userInfo } from '../seeders/userInfo';
import { wallets } from '../seeders/wallets';
import { payees } from '../seeders/payees';
import { transfers } from '../seeders/transfers';
import { appDataSource } from '../dataSource';

const run = async () => {
    await appDataSource.initialize();
    await appDataSource.transaction(async (transactionalEntityManager) => {
        // Users
        const { raw: insertedUsers } = await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(UserEntity)
            .values(users)
            .execute();

        const usersHandled = users.map((user, index) => {
            user.id = insertedUsers[index].id;

            // Prepare payee
            if (user.hasOwnProperty('payeeOwner')) {
                user.payeeOwner.userId = user.id;
            }
            return user;
        });
        const walletsPrepared: typeof wallets = [];

        // Cities
        const { raw: insertedCities } = await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(CityEntity)
            .values(cities)
            .execute();

        // User info
        const userInfoPrepared: typeof userInfo = userInfo.map(
            (userInfo, index) => {
                userInfo.userId = insertedUsers[index].id;
                userInfo.cityId = insertedCities[0].id;
                return userInfo;
            },
        );
        await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(UserInfoEntity)
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

        // Wallets
        const { raw: insertedWallets } = await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(WalletEntity)
            .values(walletsPrepared)
            .execute();
        wallets.forEach((wallet, index) => {
            wallet.id = insertedWallets[index].id;

            // Prepare payee
            if (wallet.hasOwnProperty('payeeReceiver')) {
                wallet.payeeReceiver.walletId = wallet.id;
            }
            // Prepare transfers
            if (wallet.hasOwnProperty('transferSender')) {
                wallet.transferSender.walletSenderId = wallet.id;
            }
            if (wallet.hasOwnProperty('transferReceiver')) {
                wallet.transferReceiver.walletRecipientId = wallet.id;
            }
        });

        // Payees
        await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(PayeeEntity)
            .values(payees)
            .execute();

        // Transfer
        await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(TransferEntity)
            .values(transfers)
            .execute();
    });
};

run();
