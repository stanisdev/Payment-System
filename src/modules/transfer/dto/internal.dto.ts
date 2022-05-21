import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class InternalTransferDto {
    @IsNotEmpty()
    @IsUUID('4')
    payeeId: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @IsNotEmpty()
    @IsInt()
    walletType: number;

    comment?: string;
}
