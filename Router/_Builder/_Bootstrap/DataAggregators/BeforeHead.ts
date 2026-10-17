import { registryErrorScript } from 'RequireJsLoader/bootstrap';
import { logger } from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import { ICollectedDeps } from 'UI/Deps';
import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { prepareScript } from '../html/prepareScript';

/**
 * Скрипты, которые обязательно нужно добавлять в самое начало HEAD.
 * Это обычно подписка на обработку ошибок загрузки ресурсов и <link rel="preload" .../> для прогрева cdn-доменов
 * @private
 */

export class BeforeHead implements IDataAggregatorModule {
    constructor(private staticDomains?: string) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        const HeadAPI = AppHead.getInstance();

        const cdnDomains = getCdnDomains(this.staticDomains);
        if (cdnDomains) {
            for (const cdnDomain of cdnDomains) {
                HeadAPI.createTag('link', {
                    rel: 'preconnect',
                    crossorigin: undefined,
                    href: `//${cdnDomain}`,
                    important: 'true',
                });
            }
        }

        const importantScript = prepareScript(registryErrorScript);
        HeadAPI.createTag('script', { important: 'true' }, importantScript);

        return null;
    }
}

function getCdnDomains(staticDomains: string | undefined): string[] | undefined {
    if (!staticDomains) {
        return;
    }

    let _staticDomains: { domains?: string[] };
    try {
        _staticDomains = staticDomains ? JSON.parse(staticDomains) : {};
    } catch (e) {
        logger.warn(
            'Ошибка при обработке staticDomains для прогревочных links. staticDomains = ' +
                staticDomains
        );
        return;
    }
    return _staticDomains.domains;
}
