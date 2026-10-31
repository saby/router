/**
 *
 * @author Мустафин Л.И.
 */

import { logger, setConfig } from 'Application/Env';
import type { IHttpResponse } from 'Application/Env';
import { IRouter, extractS3modFromUrl } from 'Router/router';
import { IRenderOptions } from 'Router/Builder';
import { TPageSourceData, IDataToRenderNotExist } from './Interfaces/IPageSourceData';
import { PageSourceStatus } from './Interfaces/IPageSource';
import {
    IModuleFound,
    IModuleLoadError,
    IModuleNotFound,
    ModuleLoadStatus,
} from './Interfaces/IModuleLoader';
import { ModuleLoader } from './ModuleLoader';
import { DataToRender } from './DataToRender';
import { initResponseWrapper } from './ResponseWrapper';

enum Purpose {
    prefetch = 'prefetch',
}

const RESTRICTED_EXT = /(\.js|\.css|\.json)$/;

interface IServerRoutingRequestHeaders {
    purpose?: Purpose;
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

interface IPageUrlInfo {
    alias?: string;
    pageId?: string;
}

/**
 * Функция, для получения алиаса приложения по url
 */
type TAppAliasGetter = (
    url: string,
    router: IRouter,
    headers: IServerRoutingRequest['headers']
) => Promise<IPageUrlInfo | undefined>;

const EMPTY_SABYAPP_INFO: [undefined, undefined] = [undefined, undefined];

/**
 * Класс, который загружет модуль, который необходимо построить
 * и потом вызовет метод предзагрузки данных
 * @private
 */
export class PageSourceData {
    private moduleNameGetter: typeof extractS3modFromUrl;

    constructor(
        private request: IServerRoutingRequest,
        private appAliasGetter?: TAppAliasGetter,
        moduleNameGetter?: typeof extractS3modFromUrl
    ) {
        request.compatible = false;
        this.moduleNameGetter =
            typeof moduleNameGetter === 'function' ? moduleNameGetter : extractS3modFromUrl;
    }

    /**
     * Получаем данные по Саби-приложению
     */
    private async getSabyAppInfo(options: IRenderOptions): Promise<[string?, string?]> {
        if (typeof this.appAliasGetter !== 'function') {
            return EMPTY_SABYAPP_INFO;
        }
        try {
            const pageUrlInfo =
                typeof this.appAliasGetter === 'function'
                    ? await this.appAliasGetter(
                          this.request.path,
                          options.Router as IRouter,
                          this.request.headers
                      )
                    : undefined;

            if (!pageUrlInfo) {
                return EMPTY_SABYAPP_INFO;
            }

            const appAlias = pageUrlInfo.alias;
            const pageId = pageUrlInfo.pageId;
            setConfig('appAlias', appAlias);

            return [appAlias, pageId];
        } catch (err) {
            logger.warn(err);
        }

        return EMPTY_SABYAPP_INFO;
    }

    /**
     * Загружаем файл по URL
     * @param appAlias алиас сервиса-представления в url, который не учитывается
     */
    private routeToFile(appAlias?: string): IModuleNotFound | IModuleFound | IModuleLoadError {
        const logicUrl = getLogicUrl(this.request.path, appAlias);

        // Получить название модуля, который в итоге будет строиться, по пути запроса.
        // Так же учитываются маршруты в router.json
        const s3modName = this.moduleNameGetter(logicUrl);

        return new ModuleLoader().load(s3modName);
    }

    /**
     * Загрузить модуль, вызвать метод предзагрузки данных
     * Вернет результат указанного типа
     */
    async getResult(options: IRenderOptions, response: IHttpResponse): Promise<TPageSourceData> {
        const [appAlias, pageId] = await this.getSabyAppInfo(options);
        const loadResult = this.routeToFile(appAlias);

        if (loadResult.loadStatus !== ModuleLoadStatus.SUCCESS) {
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

        // TODO пробросить PageRenderer-как инстанс, а не хранить глобально
        initResponseWrapper(response, { ...options }, loadResult, pageId);

        logger.info('RSC: loadResult.module', loadResult.module);
        const dataToRender: Promise<IDataToRenderNotExist | unknown> = new DataToRender().get(
            loadResult.module,
            this.request.url,
            loadResult.moduleName,
            options
        );
        return {
            hasData: true,
            moduleName: loadResult.moduleName,
            isRSC: loadResult.isRSC,
            dataToRender,
        };
    }
}

/**
 * Получить "логический url".
 * "Логический url" - это часть url без названия сервиса (может быть в начале url на клиенте)
 * и без алиаса приложения (может быть в начале url после названия сервиса)
 */
function getLogicUrl(url: string, appAlias?: string): string {
    if (!appAlias) {
        return url;
    }
    const urlParts = url.split('/');
    if (urlParts[1] === appAlias) {
        urlParts.splice(1, 1);
    }
    const logicUrl = urlParts.join('/');
    return logicUrl ? logicUrl : '/';
}
