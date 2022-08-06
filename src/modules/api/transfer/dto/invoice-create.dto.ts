import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceCreateDto {
    @ApiProperty({ example: 55555555 })
    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    currencyId: number;

    @ApiProperty()
    @IsInt()
    @Min(1)
    amount: number;
}
