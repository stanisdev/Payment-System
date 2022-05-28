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
            throw new BadRequestException('Email already exists');
        }
        return body;
    }
}
