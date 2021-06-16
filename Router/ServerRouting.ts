/// <amd-module name="Router/ServerRouting" />
/**
 * Рендеринг страницы на сервере
 * @author Мустафин Л.И.
 */

import { ModulesManager } from 'RequireJsLoader/conduct';
import { MaskResolver } from 'Router/router';
import { logger } from 'Application/Env';
import { headDataStore, isModuleExists } from 'UICommon/Deps';
import { mainRender, IRenderOptions } from 'Router/Builder';

export interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
}

// таймаут ожиданию предзагрузки данных для страницы
export const GET_DATA_TIMEOUT = 23000;

/**
 * В модуле, который строится на странице может быть метод getDataToRender.
 * Этот метод вернет данные для страницы.
 */
interface IModuleToRender {
    getDataToRender: (url: string) => Promise<object | false>;
}

/**
 * @enum PageSourceStatus Внутренние статусы генерации HTML кода страницы.
 */
enum PageSourceStatus {
    OK,  // все хорошо
    NOT_FOUND  // искомый модуль не найден
}

/**
 * @interface IPageSource Интерфейс для определения успешности генерации HTML кода страницы
 * @param status    Внутренний статус генерации HTML
 * @param html      HTML код страницы
 * @param error     Ошибка, которая возникла при генерации HTML
 */
interface IPageSource {
    status: PageSourceStatus;
    html?: string;
    error?: Error;
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

    /** Нужно проверять наличие модуля, перед запросом через require.
     * Иначе будет уязвимость с производительностью, потому что могут передать в адресе мусор
     * https://online.sbis.ru/opendoc.html?guid=76a641dd-1f2a-497a-aa2b-a7f102da5735
     */
    if (!isModuleExists(moduleName)) {
        return Promise.resolve({
            status: PageSourceStatus.NOT_FOUND,
            error: new Error(`Модуля с названием ${moduleName} не существует.`)
        });
    }

    let module: IModuleToRender;
    try {
        module = modulesManager.loadSync(moduleName);
    } catch (error) {
        modulesManager.unloadSync(moduleName);
        return Promise.resolve({
            status: PageSourceStatus.NOT_FOUND,
            error
        });
    }

    // TODO свойство isNewEnvironment будет пересмотрено
    // в https://online.sbis.ru/opendoc.html?guid=c28a34a5-54b2-4873-be99-f452189e64c0
    headDataStore.write('isNewEnvironment', true);

    return getDataToRender(module, request.path, moduleName)
        .then((pageConfig: object | false) => {
            options.pageConfig = pageConfig;
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
        setTimeout(reject, GET_DATA_TIMEOUT);
    });

    return Promise.race([module.getDataToRender(url), timeoutPromise])
        .then((pageConfig: object | false) => {
            return pageConfig;
        })
        .catch((err) => {
            let timeoutError: Error;
            if (err) {
                logger.error('Router/ServerRouting',
                    `Error when loading data for module ${moduleName}: ` + err.message, err);
            } else {
                timeoutError = new Error(`Timeout error while loading data for module ${moduleName}, url: ${url}`);
                logger.warn('Router/ServerRouting', timeoutError.message);
            }
            return {error: err || timeoutError};
        });
}
