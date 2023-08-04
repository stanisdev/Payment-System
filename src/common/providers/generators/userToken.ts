import * as moment from 'moment';
import { UserEntity, UserTokenEntity } from '../../../db/entities';
import { userTokenRepository } from '../../../db/repositories';
import { JwtCompleteData, JwtSignParams } from '../../types/other.type';
import { UserTokenType } from '../../enums';
import { Utils } from '../../utils';
import { Jwt } from '../jwt/index';
import { ApiAuthStrategy } from '../jwt/strategies/api.auth-strategy';

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
        const code = Utils.generateRandomString({ length: 20 });
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
        const jwtInstance = new Jwt(new ApiAuthStrategy(this.tokenType));
        const jwtParams: JwtSignParams = {
            data: {
                userId: this.user.id,
                code: record.code,
            },
            expiresIn: record.expireAt.getTime(),
        };
        this.tokenData = {
            type: this.tokenType,
            token: await jwtInstance.sign(jwtParams),
            expireAt: record.expireAt,
        };
    }
}
