import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class PayeeDto {
    @ApiProperty({ example: 55555555 })
    @IsNotEmpty()
    @IsInt()
    walletIdentifier: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    currencyId: number;

    @ApiProperty({ example: 'Mike Johnson' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'info@world.eu' })
    @IsEmail()
    email: string;

    @ApiProperty()
    phone: string;
}
