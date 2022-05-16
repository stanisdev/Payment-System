import {
    ArgumentMetadata,
    BadRequestException,
    PipeTransform,
} from '@nestjs/common';
import * as i18next from 'i18next';
import { WalletType } from '../enums';

export class ParseWalletTypePipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata): WalletType {
        const type = WalletType[value];
        if (typeof type != 'number') {
            throw new BadRequestException(i18next.t('wrong-wallet-type'));
        }
        return type;
    }
}
