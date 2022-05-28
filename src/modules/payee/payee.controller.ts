import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParsePagination } from 'src/common/decorators/parse-pagination.decorator';
import { GetPayee } from 'src/common/decorators/payee.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { GetWallet } from 'src/common/decorators/wallet.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { LimitQuery, PageQuery } from 'src/common/objects';
import { EmptyObject, Pagination, Payee } from 'src/common/types';
import { PayeeEntity, UserEntity, WalletEntity } from 'src/db/entities';
import { PayeeDto } from './dto/create.dto';
import { PayeeService } from './payee.service';

@ApiTags('Payee')
@ApiBearerAuth()
@Controller('payee')
@UseGuards(AuthGuard)
export class PayeeController {
    constructor(private readonly payeeService: PayeeService) {}

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @GetWallet() wallet: WalletEntity,
        @Body() dto: PayeeDto,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.payeeService.create(dto, wallet, user);
        return {};
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    async list(
        @ParsePagination() pagination: Pagination,
        @User() user: UserEntity,
    ): Promise<Payee[]> {
        return this.payeeService.getList(user, pagination);
    }

    @Put('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', type: 'number' })
    async edit(
        @GetPayee() payee: PayeeEntity,
        @GetWallet() wallet: WalletEntity,
        @User() user: UserEntity,
        @Body() dto: PayeeDto,
    ): Promise<EmptyObject> {
        const data = { wallet, payee, user };
        await this.payeeService.update(dto, data);
        return {};
    }

    @Delete('/:id')
    @ApiParam({ name: 'id', type: 'number' })
    @HttpCode(HttpStatus.OK)
    async remove(
        @GetPayee() payee: PayeeEntity,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.payeeService.remove(payee, user);
        return {};
    }
}
