import { logger } from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import { ICollectedDeps } from 'UI/Deps';
import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';

/**
 * Cтили для страницы. Лежат в <head>.
 * Пусть лучше страница потупит от запоздалых JS, чем будет дергаться от запоздалых CSS
 * @private
 */

export class BeforeHead implements IDataAggregatorModule {
    constructor(private staticDomains?: string) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        if (!this.staticDomains) {
            return null;
        }

        let staticDomains: { domains?: string[] };
        try {
            staticDomains = this.staticDomains ? JSON.parse(this.staticDomains) : {};
        } catch (e) {
            logger.warn(
                'Ошибка при обработке staticDomains для прогревочных links. staticDomains = ' +
                    this.staticDomains
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
