import { Injectable } from '@nestjs/common';
import { AuthServiceRepository } from './auth.repository';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
    constructor(private readonly repository: AuthServiceRepository) {}

    async signUp(signUpDto: SignUpDto) {
        await this.repository.doQuery();
        return { one: 1 };
    }
}
