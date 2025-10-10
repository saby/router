import { IFullData, IRenderOptions } from './Interface';
import { DataAggregator } from './DataAggregator';
import { BaseScripts } from './DataAggregators/BaseScripts';
import { Head } from './DataAggregators/Head';
import { FavIcon } from './DataAggregators/FavIcon';
import { Body } from './DataAggregators/Body';
import { DefaultTags } from './DataAggregators/DefaultTags';
import { JS } from './DataAggregators/JS';
import { Other } from './DataAggregators/Other';
import { UtilsScripts } from './DataAggregators/UtilsScripts';
import { WsConfig } from './DataAggregators/WsConfig';
import { Monitoring } from './DataAggregators/Monitoring';
import { LoadingStatus } from './DataAggregators/LoadingStatus';
import { PageMainDeps } from './DataAggregators/PageMainDeps';

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
    if (options.prerender) {
        return aggregateDataForEmptyPage(moduleName, options, controlsHTML);
    }

    const aggregatedData = new DataAggregator(options, moduleName)
        .add(new WsConfig())
        .add(new PageMainDeps())
        .add(new Monitoring())
        .add(new LoadingStatus())
        .add(new DefaultTags())
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

/**
 * Этап 2`
 * Незачем тратить время на сбор всех данных, если сейчас выполняется так называемый быстрый запрос за данными
 * Актуально для Google Chrome, например
 * https://online.sbis.ru/opendoc.html?guid=9a500336-5855-4d08-9c69-b27a54ff2e37
 */
function aggregateDataForEmptyPage(
    moduleName: string,
    options: IRenderOptions,
    controlsHTML: string
): IFullData {
    const aggregatedData = new DataAggregator(options, moduleName)
        .add(new PageMainDeps())
        .add(new DefaultTags())
        .add(new FavIcon())
        .add(new Head())
        .add(new Body())
        .add(new Other())
        .getData();

    return {
        ...aggregatedData,
        ...{ controlsHTML },
    } as IFullData;
}
