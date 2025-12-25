import { IFullData, IRenderOptions } from './Interface';
import { DataAggregator } from './DataAggregator';
import { BaseScripts } from './DataAggregators/BaseScripts';
import { Head } from './DataAggregators/Head';
import { Body } from './DataAggregators/Body';
import { DefaultTags } from './DataAggregators/DefaultTags';
import { JS } from './DataAggregators/JS';
import { Other } from './DataAggregators/Other';
import { UtilsScripts } from './DataAggregators/UtilsScripts';
import { WsConfig } from './DataAggregators/WsConfig';
import { Monitoring } from './DataAggregators/Monitoring';
import { LoadingStatus } from './DataAggregators/LoadingStatus';
import { PageMainDeps } from './DataAggregators/PageMainDeps';
import { BeforeHead } from './DataAggregators/BeforeHead';

/**
 * Этап 2``
 * первое получение данных для построения начала страницы
 */
export function aggregatePartialStartData(options: IRenderOptions): IFullData {
    const aggregatedData = new DataAggregator(options)
        .add(new WsConfig())
        .add(new PageMainDeps())
        .add(new Monitoring())
        .add(new LoadingStatus())
        .add(new DefaultTags())
        .add(new BeforeHead())
        .add(new Head())
        .add(new BaseScripts())
        .add(new JS())
        .getData(undefined, false);

    return aggregatedData as IFullData;
}

/**
 * Этап 2``
 * получение данных последующие разы до построения body
 */
export function aggregatePartialData(options: IRenderOptions): IFullData {
    const aggregatedData = new DataAggregator(options)
        .add(new Head())
        .add(new JS())
        .getData(undefined, false);

    return aggregatedData as IFullData;
}

/**
 * Этап 2``
 * получение данных для построения остатка страницы
 */
export function aggregatePartialEndData(
    options: IRenderOptions,
    moduleName: string | undefined,
    controlsHTML?: string
): IFullData {
    const aggregatedData = new DataAggregator(options, moduleName)
        .add(new Head())
        .add(new Body())
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
