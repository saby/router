
import * as ControlsHTMLTemplate from 'wml!Router/_Builder/_Bootstrap/ControlsHTML';

import { Body as AppBody, Head as AppHead, JSLinks as AppJSLinks } from 'Application/Page';
import { logger, setConfig } from 'Application/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import { addPageDeps, aggregateDependencies, BASE_DEPS_NAMESPACE, headDataStore,
    TIMETESTER_SCRIPTS_NAMESPACE } from 'UICommon/Deps';
import { createWsConfig, createDefaultTags, createTitle, createViewPort } from 'UI/Head';
import { render } from './_Bootstrap/HTML';
import { IFullData, IRenderOptions } from './_Bootstrap/Interface';

/**
 * Этап 1
 * @param moduleName
 * @param options
 */
function renderControls(moduleName: string, options: IRenderOptions): Promise<string | void> {
    setConfig('bootstrapWrapperMode', true);
    createTitle(options.pageConfig ? options.pageConfig.title || '' : '');
    createViewPort();
    const result: Promise<string> = Promise.resolve(ControlsHTMLTemplate({
        moduleName,
        options
    }, { key: 'bd_' }));

    return result.catch((e) => logger.error(e));
}

/**
 * Этап 2
 * @param moduleName
 * @param options
 * @param controlsHTML
 */
export function aggregateFullData(moduleName: string, options: IRenderOptions, controlsHTML: string): IFullData {
    const BodyAPI = AppBody.getInstance();
    const HeadAPI = AppHead.getInstance();
    const JSLinksAPI = AppJSLinks.getInstance();
    const JSLinksAPIBase = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);
    const JSLinksAPITimeTester = AppJSLinks.getInstance(TIMETESTER_SCRIPTS_NAMESPACE);

    /** Создаем внутри <head> стандартные теги: wsConfig, кодировка, и прочее. */
    createWsConfig(options);
    createDefaultTags(options);
    /** Добавим текущий модуль moduleName в зависимости (все дочерние добавятся сами, а он - нет) */
    addPageDeps([moduleName]);
    /** Опрашиваем depsCollector на предмет собранных зависимостей. */
    const deps = headDataStore.read('collectDependencies')();
    /** Раскидываем собранные JS и CSS зависимости по HeadAPI и JSLinksAPI */
    aggregateDependencies(options, deps);

    return {
        HeadAPIData: new TagMarkup(HeadAPI.getData().map(fromJML), { getResourceUrl: false }).outerHTML,
        BodyAPIClasses: BodyAPI.getClassString(),
        JSLinksAPIBaseData: new TagMarkup(JSLinksAPIBase.getData().map(fromJML), { getResourceUrl: false }).outerHTML,
        JSLinksAPITimeTesterData: new TagMarkup(JSLinksAPITimeTester
           .getData().map(fromJML), {getResourceUrl: false}).outerHTML,
        JSLinksAPIData: new TagMarkup(JSLinksAPI.getData().map(fromJML), { getResourceUrl: false }).outerHTML,
        requiredModules: deps.additionalDeps,
        controlsHTML,
        isCanceledRevive: options.isCanceledRevive
    };
}

/**
 * Этап 3
 * @param moduleName
 * @param fullData
 */
function renderHTML(moduleName: string, fullData: IFullData): string {
    return render({ ...fullData, ...{ moduleName } });
}

export function mainRender(moduleName: string, options: IRenderOptions): Promise<string> {
    return new Promise((pageResolve) => {
        renderControls(moduleName, options)
            .then((controlsHTML: string = '') => {
                const fullData = aggregateFullData(moduleName, options, controlsHTML);

                pageResolve(renderHTML(moduleName, fullData));
            });
    });
}

/**
 * Оборачивает <div>...</div> со старыми контролами в HTML
 * Метод вызывается в PresentationService/Service для части страниц из старого роутинга,
 * которые построены через 'wml!UI/Route' - тогда контент будет как <div>...</div>
 * @returns
 */
export function renderHTMLforOldRoutes(controlsHTML: string, options: IRenderOptions): string {
    const moduleName = options.application || '';
    const fullData = aggregateFullData(moduleName, options, controlsHTML);
    return renderHTML(moduleName, fullData);
}