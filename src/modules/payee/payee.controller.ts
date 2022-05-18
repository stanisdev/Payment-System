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
import { AuthGuard } from 'src/common/guards/auth.guard';
import { EmptyObject, Pagination, Payee } from 'src/common/types';
import { UserEntity } from 'src/db/entities';
import { PayeeDto } from './dto/create.dto';
import { PayeeService } from './payee.service';

@Controller('payee')
@UseGuards(AuthGuard)
export class PayeeController {
    constructor(private readonly payeeService: PayeeService) {}

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() payeeDto: PayeeDto,
        @User() user: UserEntity,
    ): Promise<EmptyObject> {
        await this.payeeService.create(user, payeeDto);
        return {};
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    async list(
        @ParsePagination() pagination: Pagination,
        @User() user: UserEntity,
    ): Promise<Payee[]> {
        return this.payeeService.getList(user, pagination);
    }
}
