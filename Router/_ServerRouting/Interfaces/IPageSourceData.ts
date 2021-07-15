/// <amd-module name="Router/_ServerRouting/IPageSourceData" />

import { IPageSourceNotFound } from './IPageSource';

/**
 * Интерфейс успешного результата процесса загрузки модуля и предзагрузки данных
 */
interface IPageSourceDataOK {
    hasData: true;
    moduleName: string;
    dataToRender: Promise<unknown>;
}


/**
 * Интерфейс НЕ успешного результата процесса загрузки модуля и предзагрузки данных
 */
interface IPageSourceDataNotOK {
    hasData: false;
    notFound: IPageSourceNotFound;
}

export type TPageSourceData = IPageSourceDataOK | IPageSourceDataNotOK;
