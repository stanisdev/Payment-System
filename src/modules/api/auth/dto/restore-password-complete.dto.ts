import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RestorePasswordCompleteDto {
    @ApiProperty()
    @IsNotEmpty()
    completeCode: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;
}
