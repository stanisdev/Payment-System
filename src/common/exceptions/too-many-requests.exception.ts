import * as i18next from 'i18next';
import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
    constructor() {
        super(
            i18next.t('too-many-attempts-to-login'),
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}
