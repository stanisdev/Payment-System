import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/common/types/other.type';
import { CurrencyCategoryRecord } from '../../../common/types/wallet.type';
import { CurrencyServiceRepository } from './currency.repository';

@Injectable()
export class CurrencyService {
    constructor(private readonly repository: CurrencyServiceRepository) {}

    /**
     * Get the list of currencies and
     * the related categories
     */
    async getList({
        limit,
        offset,
    }: Pagination): Promise<CurrencyCategoryRecord[]> {
        return this.repository.getCategories(limit, offset);
    }
}
