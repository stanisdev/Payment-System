import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
    imports: [ConfigModule.forRoot({}), AuthModule, UserModule, WalletModule],
})
export class AppModule {}
