/**
 * Рендеринг страницы на сервере
 * @library
 * @private
 * @author Мустафин Л.И.
 * @module
 */

import { getAppNameByUrl } from 'Router/router';
import { renderHTMLforOldRoutes, IRenderOptions } from 'Router/Builder';
import {
    TPageSourceData,
    IDataToRenderNotExist,
} from './_ServerRouting/Interfaces/IPageSourceData';
import { PageSourceData, IServerRoutingRequest } from './_ServerRouting/PageSourceData';
import { PageSource } from './_ServerRouting/PageSource';
import {
    initResponseWrapper,
    sendPartialHtml,
    disablePartialSend,
} from './_ServerRouting/ResponseWrapper';

export { TGetDataToRender } from './_ServerRouting/Interfaces/IModuleLoader';
export { GET_DATA_TIMEOUT } from './_ServerRouting/DataToRender';
export {
    renderHTMLforOldRoutes,
    PageSourceData,
    PageSource,
    IServerRoutingRequest,
    TPageSourceData,
    IDataToRenderNotExist,
    initResponseWrapper,
    sendPartialHtml,
    disablePartialSend,
};

interface IGetPageSourceConfig {
    routePrefix?: string;
}

/**
 * Получение html-кода страницы с вызовом обработчиков
 * Сейчас используется для построения страниц на wasaby-cli
 * @param options
 * @param request
 * @param onSuccessHandler
 * @param onNotFoundHandler
 */
export async function getPageSource(
    options: IRenderOptions,
    request: IServerRoutingRequest,
    onSuccessHandler: (html: string) => void,
    onNotFoundHandler: (error: Error) => void,
    config: IGetPageSourceConfig = {}
): Promise<unknown> {
    // @ts-ignore
    initResponseWrapper(process.domain?.res || {}, options);

    const moduleNameGetter = getModuleNameGetter(config?.routePrefix);
    const renderData: TPageSourceData = await new PageSourceData(
        request,
        getAppAliasByUrl,
        moduleNameGetter
    ).getResult(options);
    return new PageSource().render(options, renderData, onSuccessHandler, onNotFoundHandler);
}

/**
 * Получение функции, которая по url адресу возвращает модуль, который необходимо построить на СП
 */
function getModuleNameGetter(routePrefix: string | undefined): (url: string) => string {
    if (routePrefix === undefined) {
        return getAppNameByUrl;
    }
    let prefix: string;
    if (typeof routePrefix === 'string') {
        prefix = routePrefix[0] === '/' ? routePrefix : '/' + routePrefix;
    }
    return (url) => {
        let urlPath = decodeURIComponent(url);
        if (prefix) {
            urlPath = urlPath.replace(prefix, '');
            urlPath = urlPath.replace(/^\//, '');
        }
        return urlPath;
    };
}

/**
 * Тестовая реализация метода вычисления алиаса брендированного приложения
 * Для демок роутера - /alias/Router-demo
 */
async function getAppAliasByUrl(url: string): Promise<{ alias?: string } | undefined> {
    const urlParts = url.split('/');
    if (urlParts.length >= 3 && urlParts[2] === 'Router-demo') {
        return { alias: urlParts[1] };
    }
}
