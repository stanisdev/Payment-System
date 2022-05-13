import { IsJWT } from 'class-validator';

export class UpdateTokenDto {
    @IsJWT()
    refreshToken: string;
}
