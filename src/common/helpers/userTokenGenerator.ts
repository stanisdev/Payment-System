import * as moment from 'moment';
import { UserEntity, UserTokenEntity } from '../../db/entities';
import { userTokenRepository } from '../../db/repositories';
import { JwtCompleteData, JwtSignOptions } from '../types/other.type';
import { JwtSecretKey, UserTokenType } from '../enums';
import { Jwt } from '../providers/jwt';
import { Utils } from '../utils';

export class UserTokenGenerator {
    tokenData: JwtCompleteData;
    record: UserTokenEntity;

    constructor(
        private user: UserEntity,
        private tokenType: UserTokenType,
        private lifetime: number,
        private relatedTokenId?: number,
    ) {}

    async generateAndSave(): Promise<void> {
        const code = await Utils.generateRandomString({ length: 20 });
        const expireAt = moment().add(this.lifetime, 'hour').toDate();

        const userToken = new UserTokenEntity();
        userToken.user = this.user;
        userToken.type = this.tokenType;
        userToken.code = code;
        userToken.expireAt = expireAt;

        if (typeof this.relatedTokenId == 'number') {
            userToken.relatedTokenId = this.relatedTokenId;
        }
        this.record = await userTokenRepository.save(userToken);
    }

    async sign() {
        const { record } = this;
        const jwtOptions: JwtSignOptions = {
            data: {
                userId: this.user.id,
                code: record.code,
            },
            expiresIn: record.expireAt.getTime(),
            secretKey: JwtSecretKey.API,
        };
        this.tokenData = {
            type: this.tokenType,
            token: await Jwt.sign(jwtOptions),
            expireAt: record.expireAt,
        };
    }
}
