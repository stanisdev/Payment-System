import i18next from 'i18next';
import * as moment from 'moment';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from 'src/db/entities';
import { userRepository, userTokenRepository } from 'src/db/repositories';
import { Utils } from '../../../common/utils';
import { JwtCompleteData } from 'src/common/types/other.type';
import { UserTokenType } from 'src/common/enums';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserTokenParameters } from 'src/common/types/user.type';
import { InsertResult } from 'typeorm';

@Injectable()
export class AuthUtility {
    constructor(
        private readonly configService: ConfigService,
        private jwtService: JwtService,
    ) {}

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
        const refreshTokenData = {
            expiration: this.addHoursToDate(
                +this.configService.getOrThrow('jwt.refresh-lifetime'),
            ),
            code: this.generateCode(),
        };
        const refreshToken = await this.saveUserToken({
            user,
            tokenType: UserTokenType.REFRESH,
            expireAt: refreshTokenData.expiration,
            code: refreshTokenData.code,
        });

        /**
         * Generate access token
         */
        const accessTokenData = {
            expiration: this.addHoursToDate(
                +this.configService.getOrThrow('jwt.access-lifetime'),
            ),
            code: this.generateCode(),
        };
        await this.saveUserToken({
            user,
            tokenType: UserTokenType.ACCESS,
            expireAt: accessTokenData.expiration,
            code: accessTokenData.code,
            relatedTokenId: refreshToken.raw[0].id,
        });

        const jwtRefresh = await this.signData(
            user.id,
            refreshTokenData.code,
            refreshTokenData.expiration.getTime(),
        );
        const jwtAccess = await this.signData(
            user.id,
            accessTokenData.code,
            accessTokenData.expiration.getTime(),
        );
        return [
            {
                type: UserTokenType.REFRESH,
                token: jwtRefresh,
                expireAt: refreshTokenData.expiration,
            },
            {
                type: UserTokenType.ACCESS,
                token: jwtAccess,
                expireAt: accessTokenData.expiration,
            }
        ];
    }

    signData(userId: number, code: string, expiresIn: number) {
        return this.jwtService.signAsync(
            {
                userId,
                code,
            },
            {
                secret: this.configService.getOrThrow('jwt.api-secret'),
                expiresIn,
            }
        );
    }

    async saveUserToken(params: UserTokenParameters): Promise<InsertResult> {
        return userTokenRepository
            .createQueryBuilder()
            .insert()
            .values({
                user: params.user,
                type: params.tokenType,
                code: params.code,
                expireAt: params.expireAt,
                relatedTokenId: params.relatedTokenId ?? null,
            })
            .execute();
    }

    addHoursToDate(hours: number): Date {
        return moment().add(hours, 'hour').toDate();
    }

    generateCode(): string {
        return Utils.generateRandomString({ length: 20 });
    }
}
