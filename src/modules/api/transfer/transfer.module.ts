import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransferController } from './transfer.controller';
import { TransferServiceRepository } from './transfer.repository';
import { TransferService } from './transfer.service';
import { TransferUtility } from './transfer.utility';

@Module({
    controllers: [TransferController],
    providers: [
        TransferService,
        TransferServiceRepository,
        TransferUtility,
        ConfigService,
    ],
})
export class TransferModule {}
