import { ApiProperty } from '@nestjs/swagger';

export class RestorePasswordCompleteCodeDto {
    @ApiProperty()
    completeCode: string;
}
