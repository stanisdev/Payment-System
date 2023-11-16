import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsAcceptablePassword } from '../../../../common/decorators/validation.decorators';

export class RestorePasswordCompleteDto {
    @ApiProperty()
    @IsNotEmpty()
    completeCode: string;

    @IsAcceptablePassword()
    password: string;
}
