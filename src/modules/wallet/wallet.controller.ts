import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ParsePagination } from 'src/common/decorators/parse-pagination.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { WalletType } from 'src/common/enums';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ParseWalletTypePipe } from 'src/common/pipes/parse-wallet-type.pipe';
import { Pagination, WalletsListResult } from 'src/common/types';
import { UserEntity } from 'src/db/entities';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body('type', ParseWalletTypePipe) type: WalletType,
        @User() user: UserEntity,
    ) {
        await this.walletService.create(type, user);
        return {};
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    async list(
        @ParsePagination() pagination: Pagination,
    ): Promise<WalletsListResult[]> {
        return this.walletService.getList(pagination);
    }
}
