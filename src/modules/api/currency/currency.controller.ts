import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Router } from '../../../common/providers/router/index';
import { LimitQuery, PageQuery } from '../../../common/objects';
import { Pagination } from '../../../common/types/other.type';
import { ParsePagination } from '../../../common/decorators/parse-pagination.decorator';
import { CurrencyCategoryRecord } from '../../../common/types/wallet.type';
import { CurrencyService } from './currency.service';
import { AuthApi } from 'src/common/decorators/auth/api.decorator';

const router = Router.build('api', 'currency');

@ApiTags('currency')
@AuthApi()
@Controller(router.controller())
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}

    @Get(router.index())
    @HttpCode(HttpStatus.OK)
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    list(
        @ParsePagination() pagination: Pagination,
    ): Promise<CurrencyCategoryRecord[]> {
        return this.currencyService.getList(pagination);
    }
}
