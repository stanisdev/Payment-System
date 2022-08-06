import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ReplenishmentDto {
    @ApiProperty({ example: 55555555 })
    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    currencyId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    clientToken: string;
}
