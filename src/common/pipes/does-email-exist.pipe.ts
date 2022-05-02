import {
    PipeTransform,
    ArgumentMetadata,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class DoesEmailExistPipe implements PipeTransform {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async transform(body: any, metadata: ArgumentMetadata) {
        const user = await this.userRepository.findOneBy({
            email: body.email,
        });
        if (user instanceof Object) {
            throw new BadRequestException('Email already exists');
        }
        return body;
    }
}
