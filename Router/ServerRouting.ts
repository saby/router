/// <amd-module name="Router/ServerRouting" />
/**
 * Рендеринг страницы на сервере
 * @author Санников К.А.
 */

import { ModulesManager } from 'RequireJsLoader/conduct';
import { MaskResolver } from 'Router/router';
import { BaseRoute } from 'UI/Base';
import { Body as AppBody } from 'Application/Page';

interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
    staticConfig: object;
    pageName: string;
}

enum PageSourceStatus {
    OK,  // все хорошо
    NOT_FOUND  // искомый модуль не найден
}

interface IPageSource {
    status: PageSourceStatus;
    html?: string;
    error?: Error;
}

interface IRenderOptions {
    appRoot: string;
    wsRoot: string;
    resourceRoot: string;
    cdnRoot?: string;
    staticDomains?: string;
    logLevel?: string;
    servicesPath?: string;
    buildnumber?: string;
    product?: string;
    pageName?: string;
    RUMEnabled?: boolean;
}

/**
 * Получить название модуля, который в итоге будет строиться, по пути запроса.
 * Так же учитываются маршруты в router.json
 * @param request
 */
export function getAppName(request: IServerRoutingRequest): string {
    return MaskResolver.getAppNameByUrl(request.path);
}

interface IServerRoutingResponse {
    render: (template: string, appOptions: Record<string, unknown>) => void;
}

const _baseTemplate: string = 'wml!Controls/Application/Route';

export function renderApp(request: IServerRoutingRequest, response: IServerRoutingResponse, appName: string): void {
    request.compatible = false;
    response.render(_baseTemplate, {
        application: appName
    });
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

    return Promise.resolve(BaseRoute(Object.assign({application: moduleName}, options)))
        .then((html) => {
            //FIXME: Костылямбрий, который будет жить, пока не закончится переход на построение от шаблона #bootsrap
            const classes = AppBody.getInstance().getClassString() || '';
            return({
                status: PageSourceStatus.OK,
                html: html.replace('__htmlBodyClasses', classes).replace('__htmlBodyClasses', classes)
            });
        });
}
