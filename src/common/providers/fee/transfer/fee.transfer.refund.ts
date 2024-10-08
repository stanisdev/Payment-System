import { Fee } from 'src/common/enums';
import { FeeHandler } from 'src/common/interfaces';
import { feeRepository } from 'src/db/repositories';

export class FeeRefundTransfer implements FeeHandler {
    constructor(private transferAmount: number, private systemIncome: number) {}

    async calculate(): Promise<number> {
        if (this.transferAmount >= 100) {
            const feeRecord = await feeRepository.findOneBy({
                name: Fee.REFUND_MORE_OR_EQUAL_100,
            });
            if (feeRecord.isAvailable) {
                return feeRecord.calculatePercentage(this.systemIncome);
            }
        }
        return 0;
    }
}
