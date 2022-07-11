import { Module } from '@nestjs/common';
import { PayeeController } from './payee.controller';
import { PayeeServiceRepository } from './payee.repository';
import { PayeeService } from './payee.service';

@Module({
    controllers: [PayeeController],
    providers: [PayeeService, PayeeServiceRepository],
})
export class PayeeModule {}
