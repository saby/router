import { getScripts } from 'RequireJsLoader/bootstrap';
import {
    IDataAggregatorModule,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { getResourceUrl } from 'UI/Utils';
import { TagMarkup, fromJML } from 'UI/Base';
import { addOnloadScriptHandler, initScriptsCount } from './onloadScript';
import { getStore } from 'Application/Env';

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
    execute(): Partial<IFullData> | null {
        const API = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);

        const baseScripts: { src: string; onload?: string }[] = getScripts();
        baseScripts.push({ src: getResourceUrl('router.js') });

        const rid = getRid();
        API.createTag('script', {}, initScriptsCount(rid, baseScripts.length));

        for (const script of baseScripts) {
            const attrs = addOnloadScriptHandler({
                ...script,
                fetchpriority: 'high',
                // @ts-ignore
                'data-rid': rid,
            });
            API.createTag('script', attrs);
        }

        return {
            // @ts-ignore
            JSLinksAPIBaseData: new TagMarkup(API.getData().map(fromJML), {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}

export function getRid(): number {
    const store = getStore<Record<string, number>>('PSScriptRid');
    let rid = store.get('rid');
    if (rid === null || typeof rid === 'undefined') {
        rid = 0;
    }
    store.set('rid', rid + 1);
    return rid;
}
