import * as i18next from 'i18next';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { strictEqual as equal } from 'assert';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { adminRepository } from 'src/db/repositories';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { AdminEntity } from 'src/db/entities';
import { AdminStatus } from '../enums';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request) {
    const salt = req.headers['salt'];
    const hash = req.headers['hash'];
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    let admin: AdminEntity;
    try {
      equal(salt.length, +this.configService.getOrThrow('miscellaneous.admin-salt-length'));
      const { adminId, code } = await this.jwtService.verifyAsync(
        token,
        { secret: this.configService.getOrThrow('jwt.admin-secret') },
      );

      admin = await adminRepository
        .createQueryBuilder('admin')
        .leftJoinAndSelect('admin.tokens', 'adminToken')
        .leftJoinAndSelect('admin.roles', 'adminRoles')
        .where('admin.id = :adminId', { adminId })
        .andWhere('adminToken.serverCode = :code', { code })
        .andWhere('adminToken.expireAt > :now', { now: new Date() })
        .select([
            'admin.id',
            'admin.status',
            'adminToken.id',
            'adminToken.clientCode',
            'adminRoles.id',
            'adminRoles.name',
        ])
        .getOne();

      equal(admin instanceof AdminEntity, true);

      const isClientTokenValid = await bcrypt.compare(
        admin.tokens[0].clientCode + salt,
        hash,
      );
      equal(isClientTokenValid, true);
    } catch(error) {
      throw new UnauthorizedException();
    }

    if (admin.status === AdminStatus.BLOCKED) {
      throw new Error(i18next.t('admin.is-blocked'));
    }
    req['admin'] = admin;
    return admin;
  }
}
