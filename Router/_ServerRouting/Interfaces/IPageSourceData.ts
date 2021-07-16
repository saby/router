/// <amd-module name="Router/_ServerRouting/IPageSourceData" />

import { IPageSourceNotFound } from './IPageSource';


/**
 * Интерфейс итогового результата когда отсутствует метод getDataToRender
 * Тогда выставим следующий флаг
 */
export interface IDataToRenderNotExist {
    getDataToRender: false;
}

/**
 * Интерфейс успешного результата процесса загрузки модуля и предзагрузки данных
 */
export interface IPageSourceDataOK {
    hasData: true;
    moduleName: string;
    dataToRender: Promise<IDataToRenderNotExist | unknown>;
}


/**
 * Интерфейс НЕ успешного результата процесса загрузки модуля и предзагрузки данных
 */
export interface IPageSourceDataNotOK {
    hasData: false;
    notFound: IPageSourceNotFound;
}

export type TPageSourceData = IPageSourceDataOK | IPageSourceDataNotOK;
