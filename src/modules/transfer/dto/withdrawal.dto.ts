import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class WithdrawalDto {
    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @IsNotEmpty()
    @IsInt()
    walletType: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    direction: string;
}
