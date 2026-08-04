import { IRouter } from 'Router/router';
import { IRenderOptions } from 'Router/Builder';
import { IControlConstructor } from 'UICore/Base';
import { IPageSourceNotFound } from './IPageSource';

type IDefaultControl = IControlConstructor & {
    getDataToRender?: (
        url: string,
        params?: { prerender?: boolean } & IRenderOptions
    ) => Promise<unknown>;
};

/**
 * Тип метода, который будет вызван для предзагрузки данных при построении страницы.
 * @see https://link.sbis.ru/article/wasaby/0767bdfb-d410-42f1-94cb-80c9422d03f1#toc_e1455ca1-b59d-4c0d-ad8f-5856a309b180
 * @public
 */
export type TGetDataToRender<T = unknown> = (
    url: string,
    params: { prerender?: boolean } & IRenderOptions,
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
 * Интерфейс результата микропроцесса загрузки модуля - если модуль существует и его удалось загрузить
 * @private
 */
export interface IModuleFound {
    loadStatus: 'success';
    module: IModuleToRender;
}

/**
 * Интерфейс результата микропроцесса загрузки модуля - если модуля НЕ существует и его НЕ удалось загрузить
 * @private
 */
export interface IModuleNotFound {
    loadStatus: 'not_found';
    notFound: IPageSourceNotFound;
}
