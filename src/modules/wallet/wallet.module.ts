import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletController } from './wallet.controller';
import { WalletServiceRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

@Module({
    controllers: [WalletController],
    providers: [WalletService, WalletServiceRepository, ConfigService],
})
export class WalletModule {}
