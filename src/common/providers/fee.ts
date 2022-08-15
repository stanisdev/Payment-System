import { Fee } from '../enums';
import { feeRepository } from '../../db/repositories';

export class FeeProvider {
    public value: number = 0;

    constructor(private readonly transferAmount: number) {}

    /**
     * Determine necessary of fee charging and calculate its amount
     */
    async calculate() {
        if (this.transferAmount > 100) {
            const feeMetadata = await feeRepository.findOneBy({
                name: Fee.INTERNAL_TRANSFER_MORE_THAN_100,
            });
            if (feeMetadata.isAvailable) {
                this.value = feeMetadata.calculatePercentage(
                    this.transferAmount,
                );
            }
        }
    }

    /**
     * Define whether a fee is needed
     */
    isAvailable(): boolean {
        return this.value > 0;
    }
}
