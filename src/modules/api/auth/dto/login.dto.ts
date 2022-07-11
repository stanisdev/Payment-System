import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 5555555 })
    @IsNotEmpty()
    @IsInt()
    memberId: number;

    @ApiProperty()
    @IsNotEmpty()
    password: string;
}
