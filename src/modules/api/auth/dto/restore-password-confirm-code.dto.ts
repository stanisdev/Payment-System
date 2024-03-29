import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RestorePasswordConfirmCodeDto {
    @ApiProperty()
    @IsNotEmpty()
    confirmCode: string;
}
