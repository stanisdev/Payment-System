import * as moment from 'moment';
import { UserEntity, UserTokenEntity } from 'src/db/entities';
import { userTokenRepository } from 'src/db/repositories';
import { JwtCompleteData } from './types';
import { UserTokenType } from './enums';
import { Jwt } from './jwt';
import { Utils } from './utils';

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
        const jwtOptions = {
            data: {
                userId: this.user.id,
                code: record.code,
            },
            expiresIn: record.expireAt.getTime(),
        };
        this.tokenData = {
            type: this.tokenType,
            token: await Jwt.sign(jwtOptions),
            expireAt: record.expireAt,
        };
    }
}
