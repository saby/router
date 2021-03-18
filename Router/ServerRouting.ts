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
import { mainRender, PageSourceStatus, IPageSource, IRenderOptions } from 'Router/_ServerRouting/Bootstrap';
import { logger } from 'Application/Env';

interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
    staticConfig: object;
    pageName: string;
}

// таймаут ожиданию предзагрузки данных для страницы
const GET_DATA_TO_RENDER_TIMEOUT = 30000;

interface IModuleToRender {
    getDataToRender: (url: string) => Promise<object | false>;
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
    request.compatible = false;
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

    const modulesManager = new ModulesManager();
    const moduleName = getAppName(request);
    let module;

    try {
        module = modulesManager.loadSync(moduleName);
    } catch (error) {
        modulesManager.unloadSync(moduleName);
        return Promise.resolve({
            status: PageSourceStatus.NOT_FOUND,
            error
        });
    }

    return getDataToRender(module, request.path, moduleName)
        .then((pageConfig: object | false) => {
            // условно-старый способ генерации HTML
            if (pageConfig === false) {
                return renderOldHtml(moduleName, options);
            }

            // генерация HTML методом трёхэтпного построения верстки
            if (pageConfig && typeof pageConfig === 'object') {
                options._options = {...(options._options || {}), ...pageConfig};
            }
            return mainRender(moduleName, {application: moduleName, ...options});
        })
        .then((html) => {
            return({ status: PageSourceStatus.OK, html });
        });
}

/**
 * предзагрузка данных для страницы
 * @param module
 * @param url
 * @param moduleName
 * @return false если нет метода для предзагрузки данных или сам метод предзагрузки данных может вернуть false, для
 *               страниц, которые нужно строить по старому (от html)
 *         object тогда это новый способ построения страницы (от div)
 */
function getDataToRender(module: IModuleToRender, url: string, moduleName: string): Promise<object | false> {
    if (typeof module.getDataToRender !== 'function') {
        return Promise.resolve(false);
    }

    // Promise для ограничения по времени вызов метода предзагрузки данных
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(reject, GET_DATA_TO_RENDER_TIMEOUT);
    });

    return Promise.race([module.getDataToRender(url), timeoutPromise])
        .then((pageConfig: object | false) => {
            return pageConfig;
        })
        .catch((err) => {
            if (err) {
                logger.error('Router/ServerRouting',
                    `Error when loading data for module ${moduleName}: ` + err.message, err);
            } else {
                logger.warn('Router/ServerRouting', `Timeout error while loading data for module ${moduleName}`);
            }
            return false;
        });
}

/**
 * условно-старый способ генерации HTML
 * @param moduleName
 * @param options
 */
function renderOldHtml(moduleName: string, options: IRenderOptions): Promise<string> {
    return Promise.resolve(BaseRoute({application: moduleName, ...options}))
        .then((html) => {
            //FIXME: Костылямбрий, который будет жить, пока не закончится переход на построение от шаблона #bootsrap
            const classes = AppBody.getInstance().getClassString() || '';
            return html.replace('__htmlBodyClasses', classes).replace('__htmlBodyClasses', classes);
        });
}

/**
 * Метод трёхэтпного построения верстки
 * @param moduleName
 * @param options
 */
function renderHtml(moduleName: string, options: object): Promise<string> {
    // TODO реализация этого метода будет дополнена позже
    return Promise.resolve(BaseRoute({application: moduleName, ...options}));
}
