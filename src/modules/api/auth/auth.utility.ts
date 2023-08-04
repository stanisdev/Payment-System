import i18next from 'i18next';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from 'src/db/entities';
import { userRepository } from 'src/db/repositories';
import { Utils } from '../../../common/utils';
import { JwtCompleteData } from 'src/common/types/other.type';
import { UserTokenGenerator } from 'src/common/providers/generators/userToken';
import { UserTokenType } from 'src/common/enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthUtility {
    constructor(private readonly configService: ConfigService) {}

    /**
     * Generate and get a unique "memberId" of
     * the being created user
     */
    async generateUserMemberId(): Promise<number> {
        let memberId: number;
        for (let a = 0; a < 100; a++) {
            memberId = +Utils.generateRandomString({
                onlyDigits: true,
                length: 7,
            });
            const user = await userRepository.findOneBy({
                memberId,
            });
            if (!(user instanceof UserEntity)) {
                return memberId;
            }
        }
        throw new InternalServerErrorException(
            i18next.t('unable-to-create-user'),
        );
    }

    /**
     * Generate and get pair of the 'access-token' and
     * an appropriate 'refresh' one
     */
    async generateJwtTokens(user: UserEntity): Promise<JwtCompleteData[]> {
        /**
         * Generate refresh token
         */
        const refreshTokenGenerator = new UserTokenGenerator(
            user,
            UserTokenType.REFRESH,
            +this.configService.get('JWT_REFRESH_LIFETIME'),
        );
        await refreshTokenGenerator.generateAndSave();
        await refreshTokenGenerator.sign();
        /**
         * Generate access token
         */
        const accessTokenGenerator = new UserTokenGenerator(
            user,
            UserTokenType.ACCESS,
            +this.configService.get('JWT_ACCESS_LIFETIME'),
            refreshTokenGenerator.record.id,
        );
        await accessTokenGenerator.generateAndSave();
        await accessTokenGenerator.sign();

        return [
            accessTokenGenerator.tokenData,
            refreshTokenGenerator.tokenData,
        ];
    }
}
