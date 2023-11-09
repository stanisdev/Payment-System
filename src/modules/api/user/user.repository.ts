import { Injectable } from '@nestjs/common';
import { userInfoRepository } from '../../../db/repositories';
import { UserInfoEntity } from '../../../db/entities';

@Injectable()
export class UserServiceRepository {
    getUserInfo(userId: number): Promise<UserInfoEntity> {
        return userInfoRepository
            .createQueryBuilder('userInfo')
            .leftJoinAndSelect('userInfo.city', 'city')
            .select([
                'userInfo.accountName',
                'userInfo.fullName',
                'userInfo.country',
                'userInfo.address',
                'userInfo.zipCode',
                'userInfo.phone',
                'userInfo.accountType',
                'city.name',
            ])
            .where('userInfo.userId = :userId', { userId })
            .getOne();
    }
}
