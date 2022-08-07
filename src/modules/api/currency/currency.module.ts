import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyServiceRepository } from './currency.repository';
import { CurrencyService } from './currency.service';

@Module({
    controllers: [CurrencyController],
    providers: [CurrencyService, CurrencyServiceRepository],
})
export class CurrencyModule {}
