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
import { GetWallet } from '../../../common/decorators/wallet.decorator';
import { GetClient } from '../../../common/decorators/client.decorator';
import { ParsePagination } from '../../../common/decorators/parse-pagination.decorator';
import { WithdrawalRestriction } from '../../../common/guards/withdrawal-restriction.guard';
import { GetPayee } from '../../../common/decorators/payee.decorator';
import { User } from '../../../common/decorators/user.decorator';
import { AuthApiGuard } from '../../../common/guards/auth/api.guard';
import { LimitQuery, PageQuery } from '../../../common/objects';
import { Router } from '../../../common/providers/router/index';
import {
    InternalTransferResult,
    InvoiceResult,
    ReplenishmentResult,
    TransferReport,
    WithdrawalResult,
} from '../../../common/types/transfer.type';
import { EmptyObject, Pagination } from '../../../common/types/other.type';
import {
    ClientEntity,
    PayeeEntity,
    UserEntity,
    WalletEntity,
} from '../../../db/entities';
import { InternalTransferDto } from './dto/internal.dto';
import { ReplenishmentDto } from './dto/replenishment.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { TransferService } from './transfer.service';
import { RefundDto } from './dto/refund.dto';
import { InvoiceCreateDto } from './dto/invoice-create.dto';
import { InvoicePayDto } from './dto/invoice-pay.dto';

const router = Router.build('api', 'transfer');

@ApiTags('Transfer')
@Controller(router.controller())
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Post(router.method('internal'))
    @ApiBearerAuth()
    @UseGuards(AuthApiGuard)
    @HttpCode(HttpStatus.OK)
    async internal(
        @Body() dto: InternalTransferDto,
        @User() user: UserEntity,
        @GetPayee() payee: PayeeEntity,
    ): Promise<InternalTransferResult> {
        return this.transferService.internal(dto, user, payee);
    }

    @Post(router.method('withdrawal'))
    @ApiBearerAuth()
    @UseGuards(AuthApiGuard, WithdrawalRestriction)
    @HttpCode(HttpStatus.OK)
    async withdrawal(
        @Body() dto: WithdrawalDto,
        @User() user: UserEntity,
    ): Promise<WithdrawalResult> {
        return this.transferService.withdrawal(dto, user);
    }

    @Post(router.method('replenishment'))
    @HttpCode(HttpStatus.OK)
    async replenishment(
        @Body() dto: ReplenishmentDto,
        @GetClient() client: ClientEntity,
    ): Promise<ReplenishmentResult> {
        return this.transferService.replenishment(dto, client);
    }

    @Get(router.index())
    @ApiBearerAuth()
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    @UseGuards(AuthApiGuard)
    @HttpCode(HttpStatus.OK)
    async list(
        @ParsePagination() pagination: Pagination,
        @User() user: UserEntity,
    ): Promise<TransferReport[]> {
        return this.transferService.list(pagination, user);
    }

    @Post(router.method('refund'))
    @ApiBearerAuth()
    @UseGuards(AuthApiGuard)
    @HttpCode(HttpStatus.OK)
    async refund(
        @Body() dto: RefundDto,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.transferService.refund(dto, user);
        return {};
    }

    @Post(router.method('invoice:create'))
    @ApiBearerAuth()
    @UseGuards(AuthApiGuard)
    @HttpCode(HttpStatus.CREATED)
    async invoiceCreate(
        @GetWallet() debtorWallet: WalletEntity,
        @Body() dto: InvoiceCreateDto,
        @User() user: UserEntity,
    ): Promise<InvoiceResult> {
        return this.transferService.invoiceCreate(dto, user, debtorWallet);
    }

    @Post(router.method('invoice:pay'))
    @ApiBearerAuth()
    @UseGuards(AuthApiGuard)
    @HttpCode(HttpStatus.OK)
    async invoicePay(
        @Body() dto: InvoicePayDto,
        @User() user: UserEntity,
    ): Promise<InvoiceResult> {
        return this.transferService.invoicePay(dto, user);
    }
}
