import { Head as AppHead } from 'Application/Page';
import { getResourceUrl } from 'UI/Utils';
import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IFullData,
    IPageConfig,
} from 'Router/_Builder/_Bootstrap/Interface';

/**
 * Фавиконка. Эта микротаска используется только, если выполняется так называемый быстрый запрос за данными
 * Актуально для Google Chrome, например
 * https://online.sbis.ru/opendoc.html?guid=9a500336-5855-4d08-9c69-b27a54ff2e37
 * @private
 */

export class FavIcon implements IDataAggregatorModule {
    constructor(private favicon: IPageConfig['favicon']) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        let favicon;
        if (this.favicon) {
            favicon =
                // @ts-ignore
                this.favicon?.['64x64'] ??
                (typeof this.favicon === 'string' ? this.favicon : undefined);
        }
        favicon = favicon ?? getResourceUrl('/cdn/SabyLogo/1.0.7/favicon/favicon.ico?v=1');

        AppHead.getInstance().createTag('link', {
            rel: 'shortcut icon',
            href: favicon,
            type: 'image/x-icon',
        });

        return null;
    }
}
