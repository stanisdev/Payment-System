import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export function IsAcceptablePassword(): PropertyDecorator {
    const passwordMinLength = +process.env.USER_PASSWORD_MIN_LENGTH;

    return applyDecorators(
        ApiProperty({
            minLength: passwordMinLength,
            type: String,
        }),
        IsNotEmpty(),
        MinLength(passwordMinLength),
    );
}
