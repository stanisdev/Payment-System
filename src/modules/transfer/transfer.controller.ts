import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { GetClient } from 'src/common/decorators/client.decorator';
import { ParsePagination } from 'src/common/decorators/parse-pagination.decorator';
import { GetPayee } from 'src/common/decorators/payee.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
    InternalTransferResult,
    Pagination,
    ReplenishmentResult,
    TransferReport,
    WithdrawalResult,
} from 'src/common/types';
import { ClientEntity, PayeeEntity, UserEntity } from 'src/db/entities';
import { InternalTransferDto } from './dto/internal.dto';
import { ReplenishmentDto } from './dto/replenishment.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { TransferService } from './transfer.service';

@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Post('/internal')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async internal(
        @Body() dto: InternalTransferDto,
        @User() user: UserEntity,
        @GetPayee() payee: PayeeEntity,
    ): Promise<InternalTransferResult> {
        return this.transferService.internal(dto, user, payee);
    }

    @Post('/withdrawal')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async withdrawal(
        @Body() dto: WithdrawalDto,
        @User() user: UserEntity,
    ): Promise<WithdrawalResult> {
        return this.transferService.withdrawal(dto, user);
    }

    @Post('/replenishment')
    @HttpCode(HttpStatus.OK)
    async replenishment(
        @Body() dto: ReplenishmentDto,
        @GetClient() client: ClientEntity,
    ): Promise<ReplenishmentResult> {
        return this.transferService.replenishment(dto, client);
    }

    @Get('/')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async list(
        @ParsePagination() pagination: Pagination,
        @User() user: UserEntity,
    ): Promise<TransferReport[]> {
        return this.transferService.list(pagination, user);
    }
}
