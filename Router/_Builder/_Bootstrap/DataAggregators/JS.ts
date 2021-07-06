/// <amd-module name="Router/_Builder/_Bootstrap/DataAggregators/JS" />

import { IDataAggregatorModule, ICollectedDeps, IRenderOptions, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { cookie } from "Env/Env";
import { TagMarkup, fromJML } from 'UI/Base';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';

export class JS implements IDataAggregatorModule {
    execute(deps: ICollectedDeps, options?: IRenderOptions): Partial<IFullData> | null {
        const  API = AppJSLinks.getInstance();
        filterJsDeps(deps.js, deps.scripts)
            .map((js) => resolveLink(js))
            .concat(deps.scripts)
            .concat(deps.tmpl.map((rawLink) => resolveLink(rawLink, 'tmpl')))
            .concat(deps.wml.map((rawLink) => resolveLink(rawLink, 'wml')))
            .forEach((link, i) => {
                API.createTag('script', {
                    type: 'text/javascript',
                    src: link,
                    defer: 'defer',
                    key: `scripts_${i}`
                });
            });

        API.createTag(
            'script',
            { type: 'text/javascript' },
            `window['receivedStates']='${deps.rsSerialized}';`
        );
        /**
         * На страницах OnlineSbisRu/CompatibleTemplate зависимости пакуются в rt-пакеты и собираются DepsCollector
         * Поэтому в глобальной переменной храним имена запакованных в rt-пакет модулей
         * И игнорируем попытки require (см. WS.Core\ext\requirejs\plugins\preload.js)
         * https://online.sbis.ru/opendoc.html?guid=348beb13-7b57-4257-b8b8-c5393bee13bd
         * TODO следует избавится при отказе от rt-паковки
         */
        API.createTag(
            'script',
            { type: 'text/javascript' },
            `window['rtpackModuleNames']='${JSON.stringify(arrayToObject(deps.rtpackModuleNames))}';`
        );

        return {
            JSLinksAPIData: new TagMarkup(API.getData().map(fromJML), { getResourceUrl: false }).outerHTML
        };
    }
}

/**
 * Удаление из списка с JS зависисмостями словари локализации,
 * которые уже будут присутствовать в пакете rtpack, сформированном Сервисом Представления
 * @param jsDeps список зависимостей страницы, которые вычислил UICommon/Deps:DepsCollector
 * @param scripts список скриптов, которые пришли из СП как зависимости страницы
 * @TODO Этот код будет вынесен в middleware код приложения
 * по задаче https://online.sbis.ru/opendoc.html?guid=0331640b-df1a-4903-9cb1-3bad0077b012
 */
function filterJsDeps(jsDeps: string[], scripts: string[]): string[] {
    if (!scripts) {
        return jsDeps;
    }
    const rtpackScripts: string[] = scripts.filter((item) => item.includes('/rtpack/'));
    if (!rtpackScripts.length) {
        return jsDeps;
    }
    return jsDeps.filter((js) => !js.includes('/lang/'));
}

/** Конвертируем в hashmap для быстрого поиска имени модуля */
function arrayToObject(arr: string[]): Record<string, number> {
    const obj: Record<string, number> = {};
    let index = 0;
    for (const key of arr) {
        obj[key] = index++;
    }
    return obj;
}

function resolveLink(path: string, type: string = ''): string {
    return ModulesLoader.getModuleUrl(type ? `${type}!${path}` : path, cookie.get('s3debug'));
}
