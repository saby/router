import { IPageSourceNotFound, IPageSourceError } from './IPageSource';

/**
 * Интерфейс итогового результата когда отсутствует метод getDataToRender
 * Тогда выставим следующий флаг
 * @private
 */
export interface IDataToRenderNotExist {
    getDataToRender: false;
}

/**
 * Интерфейс успешного результата процесса загрузки модуля и предзагрузки данных
 * @private
 */
export interface IPageSourceDataOK {
    hasData: true;
    moduleName: string;
    isRSC: boolean;
    dataToRender: Promise<IDataToRenderNotExist | unknown>;
}

/**
 * Интерфейс НЕ успешного результата процесса загрузки модуля и предзагрузки данных
 * @private
 */
export interface IPageSourceDataNotOK {
    hasData: false;
    notFound: IPageSourceNotFound | IPageSourceError;
}

export type TPageSourceData = IPageSourceDataOK | IPageSourceDataNotOK;
