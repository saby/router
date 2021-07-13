/// <amd-module name="Router/ServerRouting" />
/**
 * Рендеринг страницы на сервере
 * @author Мустафин Л.И.
 */

import { MaskResolver } from 'Router/router';
import { IRenderOptions } from './_ServerRouting/_Bootstrap/Interface';
import { GET_DATA_TIMEOUT, DataToRender, PageSource, IServerRoutingRequest, IRenderPageData,
    TDataToRender } from './_ServerRouting/Render';

export { GET_DATA_TIMEOUT, DataToRender, PageSource, IRenderPageData, TDataToRender };

/**
 * Получить название модуля, который в итоге будет строиться, по пути запроса.
 * Так же учитываются маршруты в router.json
 * @param request
 * @deprecated будет удален в https://online.sbis.ru/opendoc.html?guid=fb5895eb-b6bd-42b4-9f2b-c00c463fdce0
 */
export function getAppName(request: IServerRoutingRequest): string {
    return MaskResolver.getAppNameByUrl(request.path);
}

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
    const renderData: IRenderPageData = new DataToRender(request).getResult();
    return new PageSource(options, renderData).render(onSuccessHandler, onNotFoundHandler);
}
