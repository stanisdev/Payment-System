import { IsNotEmpty } from 'class-validator';

export class RestorePasswordConfirmCodeDto {
    @IsNotEmpty()
    code: string;
}
