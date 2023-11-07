import { ApiProperty } from '@nestjs/swagger';
import { UserTokenType } from 'src/common/enums';

export class LoginPayloadDto {
    @ApiProperty({
        example: 'Access',
        description: 'Token type',
        enum: UserTokenType,
    })
    type: string;

    @ApiProperty({
        description: 'A token itself',
    })
    token: string;

    @ApiProperty({
        description: 'Expiration date',
    })
    expireAt: Date;
}
