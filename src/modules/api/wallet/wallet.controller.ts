import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParsePagination } from '../../../common/decorators/parse-pagination.decorator';
import { AuthApi } from '../../../common/decorators/auth/api.decorator';
import { User } from '../../../common/decorators/user.decorator';
import { Currency } from '../../../common/enums';
import { LimitQuery, PageQuery } from '../../../common/objects';
import { EmptyObject, Pagination } from '../../../common/types/other.type';
import { Router } from '../../../common/providers/router/index';
import { WalletsListResult } from '../../../common/types/wallet.type';
import { UserEntity } from '../../../db/entities';
import { CreateWalletDto } from './dto/create.dto';
import { WalletService } from './wallet.service';

const router = Router.build('api', 'wallet');

@ApiTags('wallet')
@AuthApi()
@Controller(router.controller())
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post(router.index())
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateWalletDto,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.walletService.create(Currency[dto.currency], user);
        return {};
    }

    @Get(router.index())
    @HttpCode(HttpStatus.OK)
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    async list(
        @ParsePagination() pagination: Pagination,
        @User() user: UserEntity,
    ): Promise<WalletsListResult[]> {
        return this.walletService.getList(pagination, user);
    }
}
