import { getScripts } from 'RequireJsLoader/bootstrap';
import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { getResourceUrl } from 'UI/Utils';
import { TagMarkup, fromJML } from 'UI/Base';
import { LoadingStatus } from 'Router/_Builder/_Bootstrap/DataAggregators/LoadingStatus';

const BASE_DEPS_NAMESPACE: string = 'baseDeps';

export const REQUIRE_PATH = 'RequireJsLoader/third-party/WebRequire';

// Базовые скрипты (кроме require), которые должны быть подключены в тело страницы (yfh), чтобы можно было хоть как-то запустить страницу
export const BASE_DEPS = {
    contents: 'contents',
    router: 'router',
};

export const REQUIRE_CONFIG = 'RequireJsLoader/config';

// Базовые скрипты, которые необходимо отфильтровать из списка остальных js зависимостей страницы
export const BASE_DEPS_LIST = [...Object.values(BASE_DEPS), REQUIRE_CONFIG];

export class BaseScripts implements IDataAggregatorModule {
    execute(options: IRenderOptions): Partial<IFullData> | null {
        const API = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);

        const baseScripts: { src: string; onload?: string }[] = getScripts();

        baseScripts.push({ src: getResourceUrl(options.metaRoot + 'router.js') });

        for (const script of baseScripts) {
            const scriptsKey = script.src.split('/').pop()?.split('.js').shift();
            API.createTag(
                'script',
                LoadingStatus.addLoadHandlers(
                    { ...script, fetchpriority: 'high' },
                    scriptsKey || ''
                )
            );
        }

        return {
            // @ts-ignore
            JSLinksAPIBaseData: new TagMarkup(API.getData().map(fromJML), {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}
