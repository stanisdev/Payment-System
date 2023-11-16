import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsAcceptablePassword } from '../../../../common/decorators/validation.decorators';

export class LoginAdminDto {
    @ApiProperty()
    @IsNotEmpty()
    readonly username: string;

    @IsAcceptablePassword()
    readonly password: string;
}
