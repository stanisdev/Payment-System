import { Fee } from 'src/common/enums';
import { FeeHandler } from 'src/common/interfaces';
import { feeRepository } from 'src/db/repositories';

export class FeeInternalTransfer implements FeeHandler {
    constructor(private amount: number) {}

    async calculate(): Promise<number> {
        if (this.amount > 100) {
            const feeRecord = await feeRepository.findOneBy({
                name: Fee.INTERNAL_TRANSFER_MORE_THAN_100,
            });
            if (feeRecord.isAvailable) {
                return feeRecord.calculatePercentage(this.amount);
            }
        }
        return 0;
    }
}
