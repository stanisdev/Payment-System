import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class RefundDto {
    @IsUUID('4')
    @IsNotEmpty()
    transferId: string;

    @IsInt()
    @Min(1)
    amount: number;
}
