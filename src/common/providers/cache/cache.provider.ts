import { CacheRecordOptions } from 'src/common/types/other.type';
import { CacheManager } from './cache.manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheProvider {
    /**
     * Create and return an instance of CacheManager
     */
    buildManager({
        template,
        identifier,
        data,
    }: CacheRecordOptions): CacheManager {
        const substituteIndex = template.indexOf('#');
        const key =
            template.slice(0, substituteIndex) +
            identifier +
            template.slice(substituteIndex + 1);

        return new CacheManager(key, data);
    }
}
