import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParsePagination } from '../../common/decorators/parse-pagination.decorator';
import { User } from '../../common/decorators/user.decorator';
import { WalletType } from '../../common/enums';
import { AuthGuard } from '../../common/guards/auth.guard';
import { LimitQuery, PageQuery } from '../../common/objects';
import { EmptyObject, Pagination } from '../../common/types/other.type';
import {
    WalletCategory,
    WalletsListResult,
} from '../../common/types/wallet.type';
import { UserEntity } from '../../db/entities';
import { CreateWalletDto } from './dto/create.dto';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateWalletDto,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.walletService.create(WalletType[dto.type], user);
        return {};
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    async list(
        @ParsePagination() pagination: Pagination,
    ): Promise<WalletsListResult[]> {
        return this.walletService.getList(pagination);
    }

    @Get('/categories')
    @HttpCode(HttpStatus.OK)
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    async categories(
        @ParsePagination() pagination: Pagination,
    ): Promise<WalletCategory[]> {
        return this.walletService.getCategories(pagination);
    }
}
