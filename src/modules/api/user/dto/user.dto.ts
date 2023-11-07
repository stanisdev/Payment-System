import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({ type: Number })
    id: number;

    @ApiProperty({
        type: Number,
        description: 'Example: 6247165',
    })
    memberId: number;

    @ApiProperty()
    email: string;

    @ApiProperty({ type: Number })
    status: number;

    @ApiProperty({ type: Date })
    createdAt: Date;
}
