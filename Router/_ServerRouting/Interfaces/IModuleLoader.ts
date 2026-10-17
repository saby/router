import { IRouter } from 'Router/router';
import { IRenderOptions } from 'Router/Builder';
import { IControlConstructor } from 'UICore/Base';
import { IPageSourceError, IPageSourceNotFound } from './IPageSource';

type IDefaultControl = IControlConstructor & {
    getDataToRender?: (url: string, params?: IRenderOptions) => Promise<unknown>;
};

/**
 * Тип метода, который будет вызван для предзагрузки данных при построении страницы.
 * @see https://link.sbis.ru/article/wasaby/0767bdfb-d410-42f1-94cb-80c9422d03f1#toc_e1455ca1-b59d-4c0d-ad8f-5856a309b180
 * @public
 */
export type TGetDataToRender<T = unknown> = (
    url: string,
    params: IRenderOptions,
    Router: IRouter
) => Promise<T>;

/**
 * В модуле, который строится на странице может быть метод getDataToRender.
 * Этот метод вернет данные для страницы.
 * @private
 */
export interface IModuleToRender {
    default: IDefaultControl;
    getDataToRender?: TGetDataToRender;
}

/**
 * Статисы загрузки модуля
 */
export enum ModuleLoadStatus {
    /**
     * модуль загружен
     */
    SUCCESS,
    /**
     * искомый модуль не найден
     */
    NOT_FOUND,
    /**
     * ошибка при загрузке модуля
     */
    ERROR,
}

/**
 * Интерфейс результата микропроцесса загрузки модуля - если модуль существует и его удалось загрузить
 * @private
 */
export interface IModuleFound {
    loadStatus: ModuleLoadStatus.SUCCESS;
    module: IModuleToRender;
    moduleName: string;
    isRSC: boolean;
}

/**
 * Интерфейс результата микропроцесса загрузки модуля - если модуля НЕ существует
 * @private
 */
export interface IModuleNotFound {
    loadStatus: ModuleLoadStatus.NOT_FOUND;
    notFound: IPageSourceNotFound;
}

/**
 * Интерфейс результата микропроцесса загрузки модуля - при загрузке модуля произошла ошибка
 * @private
 */
export interface IModuleLoadError {
    loadStatus: ModuleLoadStatus.ERROR;
    notFound: IPageSourceError;
}
