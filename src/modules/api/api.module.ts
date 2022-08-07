import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CurrencyModule } from './currency/currency.module';
import { PayeeModule } from './payee/payee.module';
import { TransferModule } from './transfer/transfer.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
    imports: [
        AuthModule,
        UserModule,
        WalletModule,
        PayeeModule,
        TransferModule,
        CurrencyModule,
    ],
})
export class ApiModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
