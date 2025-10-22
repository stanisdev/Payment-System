import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { userRepository, userTokenRepository } from 'src/db/repositories';
import { UserTokenType } from '../enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtApiStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt.api-secret'),
    });
  }

  async validate({ userId, code }: any) {
    const user = await userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const userToken = await userTokenRepository
      .createQueryBuilder('ut')
      .where('ut.userId = :userId', { userId })
      .andWhere('ut.code = :code', { code })
      .andWhere('ut.type = :tokenType')
      .andWhere('ut.expireAt > :now')
      .setParameters({
          tokenType: UserTokenType.ACCESS,
          now: new Date(),
      })
      .getOne();

    if (!userToken) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
