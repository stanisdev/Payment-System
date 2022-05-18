import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class PayeeDto {
    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @IsNotEmpty()
    @IsInt()
    walletType: number;

    @IsNotEmpty()
    name: string;

    email: string;

    phone: string;
}
