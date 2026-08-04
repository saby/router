import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks, IPageTagAttrs } from 'Application/Page';
import { getConfig } from 'Application/Env';
import { cookie } from 'Env/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import { ICollectedDeps } from 'UI/Deps';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { BASE_DEPS_LIST, getRid } from './BaseScripts';
import { addOnloadScriptHandler, initScriptsCount, startScriptCaller } from './onloadScript';

export class JS implements IDataAggregatorModule {
    constructor(private isEnd: boolean = true) {}

    execute(_: IRenderOptions, deps: ICollectedDeps): Partial<IFullData> | null {
        const API = AppJSLinks.getInstance();
        let jsDeps = deps.js
            .filter((js) => {
                return !BASE_DEPS_LIST.includes(js);
            })
            .map((js) => {
                return resolveLink(js, undefined, deps.pagexPackages);
            })
            .concat(
                deps.tmpl.map((rawLink) => {
                    return resolveLink(rawLink, 'tmpl');
                })
            )
            .concat(
                deps.wml.map((rawLink) => {
                    return resolveLink(rawLink, 'wml');
                })
            )
            .flat();
        // оставим только уникальные скрипты
        jsDeps = [...new Set(jsDeps)];

        let scriptsCount = jsDeps.length;

        if (scriptsCount > 0) {
            const rid = getRid();
            API.createTag('script', {}, initScriptsCount(rid, scriptsCount, deps.requireList));

            jsDeps.forEach((link) => {
                const baseAttrs: IPageTagAttrs = {
                    src: link,
                    // @ts-ignore
                    'data-rid': rid,
                };
                if (needAddFetchPriority(link)) {
                    baseAttrs.fetchpriority = 'high';
                }
                const attrs = addOnloadScriptHandler(baseAttrs);

                API.createTag('script', attrs);
                scriptsCount++;
            });
        }

        if (this.isEnd) {
            const rid = getRid();
            API.createTag('script', {}, startScriptCaller(rid));
        }

        if (typeof deps.rsSerialized === 'string') {
            API.createTag('script', {}, `window['receivedStates']='${deps.rsSerialized}';`);
        }

        // @ts-ignore
        const jsApiData = API.getNewData().map(fromJML);

        return {
            JSLinksAPIData: new TagMarkup(jsApiData, {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}

const SabyPageLayoutPackages = '/SabyPageLayoutPackages/';
const pageXPackagesFolder = '/page-x-packages/';

/**
 * при включенном pagex-пакетировании, необходимо pagex-пакеты добавлять с высоким приоритетом
 * поэтому проверяем, что script находится в определенном модуле или определенной папке модуля
 */
function needAddFetchPriority(link: string): boolean {
    if (link.includes(SabyPageLayoutPackages) || link.includes(pageXPackagesFolder)) {
        return true;
    }
    return false;
}

function resolveLink(
    path: string,
    type: string = '',
    isPagexPackages?: boolean
): string | string[] {
    let moduleUrl = ModulesLoader.getModuleUrl(
        type ? `${type}!${path}` : path,
        cookie.get('s3debug') as string
    );
    const isDebugMode = getConfig('isDebugReact');

    // debug + react в пакете pagex-паковки
    if (
        isDebugMode &&
        isPagexPackages &&
        moduleUrl.includes('SabyPageLayoutPackages/common/scripts')
    ) {
        return moduleUrl.replace('.min.js', '.js');
    }

    return moduleUrl;
}
