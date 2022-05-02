import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
    accountName: string;

    @IsNotEmpty()
    fullName: string;

    @IsNotEmpty()
    city: string;

    address: string;

    @IsNotEmpty()
    country: string;

    @IsNotEmpty()
    zipCode: number;

    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    accountType: string;

    @IsEmail()
    email: string;

    @MinLength(3)
    password: string;
}
