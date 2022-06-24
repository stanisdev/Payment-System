import * as i18next from 'i18next';
import {
    PipeTransform,
    ArgumentMetadata,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { userRepository } from '../../db/repositories';

@Injectable()
export class DoesEmailExistPipe implements PipeTransform {
    async transform(body: any, metadata: ArgumentMetadata) {
        const user = await userRepository.findOneBy({
            email: body.email,
        });
        if (user instanceof Object) {
            throw new BadRequestException(i18next.t('email-already-exists'));
        }
        return body;
    }
}
