import { logger, getStateReceiver } from 'Application/Env';
import { addPageDeps } from 'UI/Deps';
import { renderHTML } from './html/HtmlGenerator';
import { IFullData, IRenderOptions } from './Interface';
import { DataAggregator } from './DataAggregator';
import { PageMainDeps } from './DataAggregators/PageMainDeps';
import { PageModuleName } from './DataAggregators/PageModuleName';
import { WsConfig } from './DataAggregators/WsConfig';
import { Monitoring } from './DataAggregators/Monitoring';
import { LoadingStatus } from './DataAggregators/LoadingStatus';
import { DefaultTags } from './DataAggregators/DefaultTags';
import { BeforeHead } from './DataAggregators/BeforeHead';
import { Head } from './DataAggregators/Head';
import { Body } from './DataAggregators/Body';
import { BaseScripts } from './DataAggregators/BaseScripts';
import { UtilsScripts } from './DataAggregators/UtilsScripts';
import { JS } from './DataAggregators/JS';
import { Other } from './DataAggregators/Other';

/**
 * Оборачивает <div>...</div> со старыми контролами в HTML
 * Метод вызывается в PresentationService/Service для части страниц из старого роутинга,
 * которые построены через 'wml!UI/Route' - тогда контент будет как <div>...</div>
 */
export function renderHTMLforOldRoutes(
    controlsHTML: string,
    options: IRenderOptions
): Promise<string> {
    if (options.application) {
        // необходимо добавить в зависимости страницы "корневой" модуль
        addPageDeps([options.application]);
    }

    // "такие" страницы в браузере всегда безусловно будет строить UICore/RouteCompatible
    const moduleName = 'UICore/RouteCompatible';

    const startSerialization = Date.now();
    const resulter = () => {
        logger.info(`waiting beforeMounts is over in ${Date.now() - startSerialization} ms`);
        const fullData = aggregateFullData(options, moduleName, controlsHTML);
        return renderHTML({ ...fullData, moduleName });
    };
    return getStateReceiver().waitBeforeMounts().then(resulter, resulter);
}

/**
 * Этап 2
 * @param moduleName
 * @param options
 * @param controlsHTML
 */
export function aggregateFullData(
    options: IRenderOptions,
    moduleName: string,
    controlsHTML: string
): IFullData {
    const aggregatedData = new DataAggregator()
        .addPre(new PageMainDeps())
        .addPre(new PageModuleName(moduleName))
        .add(new WsConfig(options))
        .add(new Monitoring())
        .add(new LoadingStatus())
        .add(new DefaultTags())
        .add(new BeforeHead(options.staticDomains))
        .add(new Head())
        .add(new Body())
        .add(new BaseScripts())
        .add(new UtilsScripts())
        .add(new JS())
        .add(new Other())
        .getData();

    return {
        ...aggregatedData,
        controlsHTML,
        renderStartTime: options.renderStartTime,
    } as IFullData;
}
