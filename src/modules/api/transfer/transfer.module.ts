import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransferController } from './transfer.controller';
import { TransferServiceRepository } from './transfer.repository';
import { TransferService } from './transfer.service';
import { TransferUtility } from './transfer.utility';
import { FeeModule } from 'src/common/providers/fee/fee.module';

@Module({
    controllers: [TransferController],
    providers: [
        TransferService,
        TransferServiceRepository,
        TransferUtility,
        ConfigService,
    ],
    imports: [FeeModule],
})
export class TransferModule {}
