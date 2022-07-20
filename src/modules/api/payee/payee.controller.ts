import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParsePagination } from '../../../common/decorators/parse-pagination.decorator';
import { GetPayee } from '../../../common/decorators/payee.decorator';
import { User } from '../../../common/decorators/user.decorator';
import { GetWallet } from '../../../common/decorators/wallet.decorator';
import { LimitQuery, PageQuery } from '../../../common/objects';
import { EmptyObject, Pagination } from '../../../common/types/other.type';
import { Payee } from '../../../common/types/payee.type';
import { PayeeEntity, UserEntity, WalletEntity } from '../../../db/entities';
import { Router } from '../../../common/providers/router/index';
import { AuthApi } from '../../../common/decorators/auth/api.decorator';
import { PayeeDto } from './dto/create.dto';
import { PayeeService } from './payee.service';

const router = Router.build('api', 'payee');

@ApiTags('Payee')
@AuthApi()
@Controller(router.controller())
export class PayeeController {
    constructor(private readonly payeeService: PayeeService) {}

    @Post(router.index())
    @HttpCode(HttpStatus.CREATED)
    async create(
        @GetWallet() wallet: WalletEntity,
        @Body() dto: PayeeDto,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.payeeService.create(dto, wallet, user);
        return {};
    }

    @Get(router.index())
    @HttpCode(HttpStatus.OK)
    @ApiQuery(LimitQuery)
    @ApiQuery(PageQuery)
    async list(
        @ParsePagination() pagination: Pagination,
        @User() user: UserEntity,
    ): Promise<Payee[]> {
        return this.payeeService.getList(user, pagination);
    }

    @Put(router.id())
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

    @Delete(router.id())
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
