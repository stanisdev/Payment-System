import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class RestorePasswordInitiateDto {
    @ApiProperty({ example: 5555555 })
    @IsNotEmpty()
    @IsInt()
    memberId: number;

    @ApiProperty({ example: 'info@world.eu' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
