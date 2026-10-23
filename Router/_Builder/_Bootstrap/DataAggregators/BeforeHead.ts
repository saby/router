import { logger } from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';

/**
 * Cтили для страницы. Лежат в <head>.
 * Пусть лучше страница потупит от запоздалых JS, чем будет дергаться от запоздалых CSS
 * @private
 */

export class BeforeHead implements IDataAggregatorModule {
    execute(options: IRenderOptions): Partial<IFullData> | null {
        if (!options.staticDomains) {
            return null;
        }

        let staticDomains: { domains?: string[] };
        try {
            staticDomains =
                typeof options.staticDomains === 'string'
                    ? JSON.parse(options.staticDomains)
                    : options.staticDomains;
        } catch (e) {
            logger.warn(
                'Ошибка при обработке staticDomains для прогревочных links. staticDomains = ' +
                    options.staticDomains
            );
            return null;
        }
        if (staticDomains.domains) {
            const HeadAPI = AppHead.getInstance();
            for (const cdnDomain of staticDomains.domains) {
                HeadAPI.createTag('link', {
                    rel: 'preconnect',
                    crossorigin: undefined,
                    href: `//${cdnDomain}`,
                    important: 'true',
                });
            }
        }

        return null;
    }
}
