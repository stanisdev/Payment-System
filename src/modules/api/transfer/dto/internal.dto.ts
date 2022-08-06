import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class InternalTransferDto {
    @ApiProperty({ example: '43bec0e1-bd6a-4e18-8cbd-8da960dd7b99' })
    @IsNotEmpty()
    @IsUUID('4')
    payeeId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    amount: number;

    @ApiProperty({ example: 55555555 })
    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    currencyId: number;

    @ApiProperty()
    comment?: string;
}
