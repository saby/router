/// <amd-module name="Router/ServerRouting" />
/**
 * Рендеринг страницы на сервере
 * @author Мустафин Л.И.
 */

import { renderHTMLforOldRoutes, IRenderOptions } from 'Router/Builder';
import { TPageSourceData, IDataToRenderNotExist } from './_ServerRouting/Interfaces/IPageSourceData';
import { PageSourceData, IServerRoutingRequest } from './_ServerRouting/PageSourceData';
import { PageSource } from './_ServerRouting/PageSource';

export { GET_DATA_TIMEOUT } from './_ServerRouting/DataToRender';
export { renderHTMLforOldRoutes, PageSourceData, PageSource, IServerRoutingRequest, TPageSourceData,
    IDataToRenderNotExist };


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
