import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class RestorePasswordInitiateDto {
    @IsNotEmpty()
    @IsInt()
    memberId: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;
}
