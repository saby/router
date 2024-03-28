/**
 *
 * @author Мустафин Л.И.
 */

import { getAppNameByUrl, IRouter } from 'Router/router';
import { TPageSourceData, IDataToRenderNotExist } from './Interfaces/IPageSourceData';
import { PageSourceStatus } from './Interfaces/IPageSource';
import { IModuleFound, IModuleNotFound } from './Interfaces/IModuleLoader';
import { ModuleLoader } from './ModuleLoader';
import { DataToRender } from './DataToRender';

enum Purpose {
    prefetch = 'prefetch',
}

enum CDN {
    sbis = 'cdn.sbis.ru',
}

const RESTRICTED_EXT = /(.js|.css|.json)$/;

interface IServerRoutingRequestHeaders {
    purpose?: Purpose;
    'x-cdn'?: string;
}

export interface IServerRoutingRequest {
    path: string; // url-адрес без названия сервиса и query параметров, напр. /my/path
    url: string; // url-адрес без названия сервиса, напр. /my/path?query=value
    originalUrl: string; // url-адрес включая название сервиса, напр. /service/my/path?query=value
    baseUrl: string; // название сервиса, напр. /service
    compatible: boolean;
    staticConfig: object;
    pageName: string;
    headers: IServerRoutingRequestHeaders;
}

/**
 * Класс, который загружет модуль, который необходимо построить
 * и потом вызовет метод предзагрузки данных
 * @private
 */
export class PageSourceData {
    private readonly _prerender: boolean = false;
    private readonly _sbisCDN: boolean = false;
    private moduleNameGetter: (url: string) => string;

    constructor(
        private request: IServerRoutingRequest,
        moduleNameGetter?: (url: string) => string
    ) {
        request.compatible = false;
        this._sbisCDN = _sbisCDN(request);
        this.moduleNameGetter =
            typeof moduleNameGetter === 'function' ? moduleNameGetter : getAppNameByUrl;
    }

    /**
     * Загрузить модуль, вызвать метод предзагрузки данных
     * Вернет результат указанного типа
     * @returns
     */
    getResult(Router: IRouter): TPageSourceData {
        // Получить название модуля, который в итоге будет строиться, по пути запроса.
        // Так же учитываются маршруты в router.json
        const moduleName = this.moduleNameGetter(this.request.path);

        const loadResult: IModuleNotFound | IModuleFound = new ModuleLoader().load(moduleName);
        if (loadResult.loadStatus === 'not_found') {
            return {
                hasData: false,
                notFound: loadResult.notFound,
            };
        }
        // Случай когда сразу после запроса страницы сервис пошел обновляться.
        // Поэтому require не смог корректно вычислить пути до модулей
        // и они начали запрашиваться как например "/page/category/136c/city/Env/Env.js"
        else if (this.request.path.match(RESTRICTED_EXT)) {
            return {
                hasData: false,
                notFound: {
                    status: PageSourceStatus.NOT_FOUND,
                    error: new Error(
                        'В url-адресе в конце есть расширение файла.' +
                            ' Такие файлы должны отдаваться сервисом статики и не должны доходить до роутинга.'
                    ),
                },
            };
        }

        const dataToRender: Promise<IDataToRenderNotExist | unknown> = new DataToRender(
            this._prerender
        ).get(loadResult.module, this.request.url, moduleName, Router);
        return {
            hasData: true,
            prerender: this._prerender,
            sbisCDN: this._sbisCDN,
            moduleName,
            dataToRender,
        };
    }
}

/**
 * Признак того, страницу будет обслуживать CDN sbis
 */
function _sbisCDN(request: IServerRoutingRequest): boolean {
    return !!(request.headers['x-cdn'] && request.headers['x-cdn'] === CDN.sbis);
}
