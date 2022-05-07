import { IsInt, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsInt()
    memberId: number;

    @IsNotEmpty()
    password: string;
}
