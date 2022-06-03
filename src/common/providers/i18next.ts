import * as i18next from 'i18next';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';

export const init = async () => {
    const localesDir = join(dirname(dirname(__dirname)), 'locales');
    const dirs = await readdir(localesDir);

    const resources = {};
    for (const language of dirs) {
        const translationFile = join(localesDir, language, 'translation');
        const content = await import(translationFile);
        resources[language] = content;
    }
    i18next.init({
        lng: 'en',
        fallbackLng: 'en',
        ns: ['translation'],
        defaultNS: 'translation',
        debug: false,
        resources,
    });
};
