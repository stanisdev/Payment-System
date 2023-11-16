import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { IsAcceptablePassword } from '../../../../common/decorators/validation.decorators';

export class LoginDto {
    @ApiProperty({ example: 6247165 })
    @IsNotEmpty()
    @IsInt()
    readonly memberId: number;

    @IsAcceptablePassword()
    readonly password: string;
}
