import { CurrencyCategoryEntity } from '../../../db/entities';
import { currencyCategoryRepository } from '../../../db/repositories';

export class CurrencyServiceRepository {
    getCategories(
        limit: number,
        offset: number,
    ): Promise<CurrencyCategoryEntity[]> {
        return currencyCategoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.currencies', 'currency')
            .select([
                'category.id',
                'category.name',
                'currency.id',
                'currency.name',
            ])
            .orderBy('category.name', 'ASC')
            .limit(limit)
            .offset(offset)
            .getMany();
    }
}
