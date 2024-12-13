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
        const refreshToken = new UserTokenGenerator();
        refreshToken.setParameters({
            user,
            tokenType: UserTokenType.REFRESH,
            lifetime: +this.configService.getOrThrow('jwt.refresh-lifetime'),
        });
        await refreshToken.generateAndSave();
        await refreshToken.sign();

        /**
         * Generate access token
         */
        const accessToken = new UserTokenGenerator();
        accessToken.setParameters({
            user,
            tokenType: UserTokenType.ACCESS,
            lifetime: +this.configService.getOrThrow('jwt.access-lifetime'),
            relatedTokenId: refreshToken.record.id,
        });
        await accessToken.generateAndSave();
        await accessToken.sign();

        return [accessToken.tokenData, refreshToken.tokenData];
    }
}
