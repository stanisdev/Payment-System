import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsIn,
    IsNotEmpty,
    IsPhoneNumber,
    MinLength,
} from 'class-validator';
import { AccountType } from 'src/common/enums';

export class SignUpDto {
    @ApiProperty({ example: 'john' })
    readonly accountName: string;

    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    readonly fullName: string;

    @ApiProperty({ example: 'Tokio' })
    @IsNotEmpty()
    readonly city: string;

    @ApiProperty()
    readonly address: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly country: string;

    @ApiProperty({ example: 8900001 })
    @IsNotEmpty()
    readonly zipCode: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsPhoneNumber()
    readonly phone: string;

    @ApiProperty({
        enum: AccountType,
    })
    @IsNotEmpty()
    @IsIn(['Personal', 'Business'])
    readonly accountType: string;

    @ApiProperty({ example: 'info@world.eu' })
    @IsEmail()
    readonly email: string;

    @ApiProperty()
    @MinLength(3)
    readonly password: string;
}
