import { ApiProperty } from '@nestjs/swagger';
import { UserEntity, UserInfoEntity } from 'src/db/entities';

export class UserPayloadDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    memberId: number;

    @ApiProperty()
    email: string;

    @ApiProperty()
    accountName: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    zipCode: number;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    accountType: string;

    @ApiProperty()
    status: number;

    @ApiProperty()
    createdAt: Date;

    constructor(user: UserEntity) {
        this.id = user.id;
        this.memberId = user.memberId;
        this.email = user.email;
        this.status = user.status;
        this.createdAt = user.createdAt;
    }

    addFromUserInfo(userInfo: UserInfoEntity) {
        this.accountName = userInfo.accountName;
        this.fullName = userInfo.fullName;
        this.country = userInfo.country;
        this.city = userInfo.city.name;
        this.address = userInfo.address;
        this.zipCode = userInfo.zipCode;
        this.phone = userInfo.phone;
        this.accountType = userInfo.accountType;
    }
}
