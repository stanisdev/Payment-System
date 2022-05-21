import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferServiceRepository } from './transfer.repository';
import { TransferService } from './transfer.service';

@Module({
    controllers: [TransferController],
    providers: [TransferService, TransferServiceRepository],
})
export class TransferModule {}
