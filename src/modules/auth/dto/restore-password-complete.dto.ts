import { IsNotEmpty } from 'class-validator';

export class RestorePasswordCompleteDto {
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    password: string;
}
