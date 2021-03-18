/// <amd-module name="Router/ServerRouting" />
/**
 * Рендеринг страницы на сервере
 * @author Санников К.А.
 */

import { ModulesManager } from 'RequireJsLoader/conduct';
import { MaskResolver } from 'Router/router';
// @ts-ignore
import { BaseRoute } from 'UI/Base';
// @ts-ignore
import { Body as AppBody } from 'Application/Page';
// @ts-ignore
import { mainRender, PageSourceStatus, IPageSource, IRenderOptions } from 'Router/Bootstrap';

interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
    staticConfig: object;
    pageName: string;
}

/**
 * Получить название модуля, который в итоге будет строиться, по пути запроса.
 * Так же учитываются маршруты в router.json
 * @param request
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
    return renderPageSource(options, request)
        .then((pageSource: IPageSource) => {
            switch (pageSource.status) {
                case PageSourceStatus.OK:
                    onSuccessHandler(pageSource.html);
                    break;
                case PageSourceStatus.NOT_FOUND:
                default:
                    onNotFoundHandler(pageSource.error);
            }
            return pageSource;
        });
}

/**
 * Генерация html-кода страницы
 * @param options
 * @param request
 */
function renderPageSource(options: IRenderOptions, request: IServerRoutingRequest): Promise<IPageSource> {
    request.compatible = false;

    const modulesManager = new ModulesManager();
    const moduleName = getAppName(request);

    try {
        modulesManager.loadSync(moduleName);
    } catch (error) {
        modulesManager.unloadSync(moduleName);
        return Promise.resolve({
            status: PageSourceStatus.NOT_FOUND,
            error
        });
    }

    return Promise.resolve(mainRender(moduleName, Object.assign({application: moduleName}, options)));
}
