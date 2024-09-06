import { FeeBasicParams, FeeRefundParams } from './fee.types';
import { TransferType } from 'src/common/enums';
import { FeeInternalTransfer } from './transfer/fee.transfer.internal';
import { FeeRefundTransfer } from './transfer/fee.transfer.refund';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeeProvider {
    /**
     * Determine necessary of fee charging and calculate its amount
     */
    calculate(params: FeeBasicParams | FeeRefundParams): Promise<number> {
        const { transfer } = params;

        if (
            [TransferType.INTERNAL, TransferType.INVOICE_PAID].includes(
                transfer.type,
            )
        ) {
            return new FeeInternalTransfer(transfer.amount).calculate();
        } else if (transfer.type == TransferType.REFUND) {
            return new FeeRefundTransfer(
                transfer.amount,
                (params as FeeRefundParams).systemIncome,
            ).calculate();
        } else {
            return Promise.resolve(0);
        }
    }
}
