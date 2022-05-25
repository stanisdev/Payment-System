import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ReplenishmentDto {
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
    clientToken: string;
}
