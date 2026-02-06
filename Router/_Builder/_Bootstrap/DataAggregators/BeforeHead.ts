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
        if (
            options.staticDomains &&
            options.staticDomains.domains &&
            options.staticDomains.domains.length === 1
        ) {
            const HeadAPI = AppHead.getInstance();
            const cdnDomain = options.staticDomains.domains[0];
            HeadAPI.createTag('link', {
                rel: 'preconnect',
                crossorigin: undefined,
                href: `//${cdnDomain}/`,
                important: 'true',
            });
        }

        return null;
    }
}
