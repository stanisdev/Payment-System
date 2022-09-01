import { FeeBasicParams, FeeRefundParams } from './types';
import { TransferType } from 'src/common/enums';
import { FeeInternalTransfer } from './transfers/internal';
import { FeeRefund } from './transfers/refund';
import { FeeHandler } from 'src/common/interfaces';

export class FeeProvider {
    public value = 0;

    constructor(private params: FeeBasicParams | FeeRefundParams) {}

    /**
     * Determine necessary of fee charging and calculate its amount
     */
    async calculate() {
        const { params } = this;
        const { transfer } = params;
        let handler: FeeHandler;

        if (
            [TransferType.INTERNAL, TransferType.INVOICE_PAID].includes(
                transfer.type,
            )
        ) {
            handler = new FeeInternalTransfer(transfer.amount);
        } else if (transfer.type == TransferType.REFUND) {
            handler = new FeeRefund(
                transfer.amount,
                (params as FeeRefundParams).systemIncome,
            );
        }
        this.value = await handler.calculate();
    }

    /**
     * Define whether a fee is needed
     */
    isAvailable(): boolean {
        return this.value > 0;
    }
}
