import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks, IPageTagAttrs } from 'Application/Page';
import { getConfig, cookie, query } from 'Application/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import { ICollectedDeps } from 'UI/Deps';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { BASE_DEPS_LIST, getRid } from './BaseScripts';
import { addOnloadScriptHandler, initScriptsCount, startScriptCaller } from './onloadScript';

export class JS implements IDataAggregatorModule {
    constructor(private isEnd: boolean = true) {}

    execute(deps: ICollectedDeps): Partial<IFullData> | null {
        if (query.get.isCanceledRevive === 'noscripts') {
            return null;
        }

        if (this.isEnd && !(deps.requiredModules?.length ?? 0)) {
            // isEnd = true в двух случаях: при непотоковом построении или при потоковом построении при формировании последней порции html
            // если не оказалось списка модулей для require в стартовом скрипте (requiredModules), то просто не запускаем этот аггрегатор
            return null;
        }

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
const REACT_BUNDLE_PARTS = [
    'React/react-superbundle.package',
    'React/third-party/v19/react/react',
    'React/third-party/v19/react/jsx-runtime/react-jsx-runtime',
    'React/third-party/v19/react/jsx-dev-runtime/react-jsx-dev-runtime',
    'React/third-party/v19/react-dom/react-dom',
    'React/third-party/v19/react-dom/client/react-dom-client',
    'React/third-party/v19/react-dom/server/react-dom-server-legacy.browser',
    'React/third-party/v19/scheduler/scheduler',
];

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
    const moduleUrl = ModulesLoader.getModuleUrl(
        type ? `${type}!${path}` : path,
        cookie.get('s3debug') as string
    );
    const isDebugMode = getConfig('isDebugReact');

    // s3debug включает debug-режим сразу для всех модулей. Для замеров производительности
    // оставляем возможность точечно загрузить production-сборку React. Проверяем как сам
    // superbundle, так и его части: пакет может быть распакован из-за другой зависимости.
    if (cookie.get('disableDebugModeForPerformanceCalc') === 'true') {
        const minifiedReactUrl = getMinifiedReactUrl(moduleUrl);
        if (minifiedReactUrl) {
            return minifiedReactUrl;
        }
    }

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

function getMinifiedReactUrl(moduleUrl: string): string | null {
    const reactBundlePart = REACT_BUNDLE_PARTS.find((path) => {
        return moduleUrl.includes(`${path}.js`);
    });
    if (!reactBundlePart) {
        return null;
    }
    return moduleUrl.replace(`${reactBundlePart}.js`, `${reactBundlePart}.min.js`);
}
