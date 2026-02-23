import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks, IPageTagAttrs } from 'Application/Page';
import { getConfig } from 'Application/Env';
import { cookie } from 'Env/Env';
import { TagMarkup, fromJML, isReact19 } from 'UI/Base';
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
                return resolveLink(js);
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

const REACT_BUNDLE_PATH = 'React/react-superbundle.package';

/**
 * Разворачивает react-superbundle.package.min.js в массив исходных путей.
 * @param isReact19 — true для v19, false для v17
 * @param moduleUrl — путь до ресурсов
 */
function getReactBundleParts(isReact19: boolean, moduleUrl: string): string[] {
    const version = isReact19 ? 'v19' : 'v17';
    const base = `${getPrefix(moduleUrl)}/${version}`;

    // версия файла ?x_module=
    const suffix = getSuffix(moduleUrl);

    const parts = [
        `${base}/react/react${suffix}`,
        `${base}/react/jsx-runtime/react-jsx-runtime${suffix}`,
        `${base}/react-dom/react-dom${suffix}`,
        `${base}/react/jsx-dev-runtime/react-jsx-dev-runtime${suffix}`,
        `${base}/react-dom/client/react-dom-client${suffix}`,
    ];

    if (isReact19) {
        parts.push(
            `${base}/scheduler/scheduler${suffix}`,
            `${base}/react-dom/server/react-dom-server-legacy.browser${suffix}`
        );
    }

    return parts;
}

function getSuffix(moduleUrl: string): string {
    const index = moduleUrl.indexOf('?');
    const result = index >= 0 ? moduleUrl.slice(index) : '';
    return `.js${result}`;
}

function getPrefix(moduleUrl: string): string {
    const clean = moduleUrl.split('?')[0];
    let beforeBundle = clean.split(REACT_BUNDLE_PATH)[0] || '';
    if (beforeBundle.endsWith('/')) {
        beforeBundle = beforeBundle.slice(0, -1);
    }
    return beforeBundle + '/React/third-party';
}

function resolveLink(path: string, type: string = ''): string | string[] {
    let moduleUrl = ModulesLoader.getModuleUrl(
        type ? `${type}!${path}` : path,
        cookie.get('s3debug') as string
    );

    const _isReact19 = isReact19();
    const isDebugMode = getConfig('isDebugReact');

    if (_isReact19) {
        moduleUrl = moduleUrl.replace('v17', 'v19');
    }

    // debug или react19 + react-superbundle, значит разворачиваем бандл
    if ((isDebugMode || _isReact19) && moduleUrl.includes(REACT_BUNDLE_PATH)) {
        return getReactBundleParts(_isReact19, moduleUrl);
    }

    // включаем дебаг режим только для определенных демок
    if (isDebugMode && /React\/third-party(\/v(17|19))?\/react/.test(moduleUrl)) {
        moduleUrl = moduleUrl.replace('.min.js', '.js');
    }

    return moduleUrl;
}
