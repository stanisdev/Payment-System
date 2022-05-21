import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PayeeModule } from './payee/payee.module';
import { TransferModule } from './transfer/transfer.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
    imports: [
        ConfigModule.forRoot({}),
        AuthModule,
        UserModule,
        WalletModule,
        PayeeModule,
        TransferModule,
    ],
})
export class AppModule {}
