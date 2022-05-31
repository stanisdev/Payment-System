import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
    @ApiProperty({ example: 'john' })
    accountName: string;

    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: 'Tokio' })
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    @IsNotEmpty()
    country: string;

    @ApiProperty({ example: 8900001 })
    @IsNotEmpty()
    zipCode: number;

    @ApiProperty()
    @IsNotEmpty()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsIn(['Personal', 'Business'])
    accountType: string;

    @ApiProperty({ example: 'info@world.eu' })
    @IsEmail()
    email: string;

    @ApiProperty()
    @MinLength(3)
    password: string;
}
