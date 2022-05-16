import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import { WalletType } from 'src/common/enums';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ParseWalletTypePipe } from 'src/common/pipes/parse-wallet-type.pipe';
import { UserEntity } from 'src/db/entities';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get('/create')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Query('type', ParseWalletTypePipe) type: WalletType,
        @User() user: UserEntity,
    ) {
        await this.walletService.create(type, user);
        return {};
    }

    @Get('/list')
    @HttpCode(HttpStatus.OK)
    async list() {}
}
