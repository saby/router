/// <amd-module name="Router/ServerRouting" />
/**
 * Рендеринг страницы на сервере
 * @author Мустафин Л.И.
 */

import { renderHTMLforOldRoutes, IRenderOptions } from 'Router/Builder';

import { GET_DATA_TIMEOUT, PageSourceData, PageSource, IServerRoutingRequest, TPageSourceData } from './_ServerRouting/Render';

export { renderHTMLforOldRoutes, GET_DATA_TIMEOUT, PageSourceData, PageSource, IServerRoutingRequest };


/**
 * Получение html-кода страницы с вызовом обработчиков
 * @param options
 * @param request
 * @param onSuccessHandler
 * @param onNotFoundHandler
 */
export function getPageSource(options: IRenderOptions, request: IServerRoutingRequest,
                              onSuccessHandler: (html: string) => void,
                              onNotFoundHandler: (error: Error) => void): Promise<unknown> {
    const renderData: TPageSourceData = new PageSourceData(request).getResult();
    return new PageSource().render(options, renderData, onSuccessHandler, onNotFoundHandler);
}
