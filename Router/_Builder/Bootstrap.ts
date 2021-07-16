
import * as ControlsHTMLTemplate from 'wml!Router/_Builder/_Bootstrap/ControlsHTML';
import { logger, setConfig } from 'Application/Env';
import { createTitle, createViewPort } from 'UI/Head';
import { addPageDeps } from 'UICommon/Deps';
import { render } from './_Bootstrap/HTML';
import { IFullData, IRenderOptions } from './_Bootstrap/Interface';
import { DataAggregator } from './_Bootstrap/DataAggregator';
import { BaseScripts } from './_Bootstrap/DataAggregators/BaseScripts';
import { CSS } from './_Bootstrap/DataAggregators/CSS';
import { Body } from './_Bootstrap/DataAggregators/Body';
import { DefaultTags } from './_Bootstrap/DataAggregators/DefaultTags';
import { JS } from './_Bootstrap/DataAggregators/JS';
import { Other } from './_Bootstrap/DataAggregators/Other';
import { UtilsScripts } from './_Bootstrap/DataAggregators/UtilsScripts';
import { WsConfig } from './_Bootstrap/DataAggregators/WsConfig';

/**
 * Этап 1
 * @param moduleName
 * @param options
 */
function renderControls(moduleName: string, options: IRenderOptions): Promise<string | void> {
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
    const aggregatedData = new DataAggregator(moduleName, options)
        .add(new WsConfig())
        .add(new DefaultTags())
        .add(new CSS())
        .add(new Body())
        .add(new BaseScripts())
        .add(new UtilsScripts())
        .add(new JS())
        .add(new Other())
        .getData();

    return ({
        ...aggregatedData,
        ...{controlsHTML}
    } as IFullData);
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
    // необходимо добавить в зависимости страницы "корневой" модуль
    addPageDeps([options.application]);

    // "такие" страницы в браузере всегда безусловно будет строить UICore/Base:RouteCompatible
    const moduleName = 'UICore/Base:RouteCompatible';

    const fullData = aggregateFullData(moduleName, options, controlsHTML);
    return renderHTML(moduleName, fullData);
}
