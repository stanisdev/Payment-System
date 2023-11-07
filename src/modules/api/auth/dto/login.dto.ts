import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 6247165 })
    @IsNotEmpty()
    @IsInt()
    readonly memberId: number;

    @ApiProperty()
    @IsNotEmpty()
    readonly password: string;
}
