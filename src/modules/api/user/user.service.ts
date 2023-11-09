import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../db/entities';
import { UserPayloadDto } from './dto/payload/user-payload.dto';
import { UserServiceRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private readonly repository: UserServiceRepository) {}

    /**
     * Get full user's information
     */
    async getFullInfo(user: UserEntity): Promise<UserPayloadDto> {
        const payload = new UserPayloadDto(user);
        const userInfo = await this.repository.getUserInfo(user.id);

        if (userInfo instanceof Object) {
            payload.addUserInfo(userInfo);
        }
        return payload;
    }
}
