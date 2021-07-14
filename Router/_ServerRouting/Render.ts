/// <amd-module name="Router/_ServerRouting/Render" />
/**
 * Классы для рендеринга страницы
 * @author Мустафин Л.И.
 */

import { ModulesManager } from 'RequireJsLoader/conduct';
import { logger } from 'Application/Env';
import { headDataStore, isModuleExists } from 'UICommon/Deps';
import { MaskResolver } from 'Router/router';
import { mainRender } from 'Router/_ServerRouting/Bootstrap';
import { IRenderOptions } from 'Router/_ServerRouting/_Bootstrap/Interface';


export interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
    staticConfig: object;
    pageName: string;
}

// таймаут ожиданию предзагрузки данных для страницы
export const GET_DATA_TIMEOUT = 23000;

/**
 * В модуле, который строится на странице может быть метод getDataToRender.
 * Этот метод вернет данные для страницы.
 */
interface IModuleToRender {
    getDataToRender: (url: string) => Promise<unknown>;
}

/**
 * @enum PageSourceStatus Внутренние статусы генерации HTML кода страницы.
 */
enum PageSourceStatus {
    OK,  // все хорошо
    NOT_FOUND  // искомый модуль не найден
}

/**
 * @interface IPageSourceOK Интерфейс для успешной генерации HTML кода страницы
 * @param status    Внутренний статус генерации HTML
 * @param html      HTML код страницы
 * @param error     Ошибка, которая возникла при генерации HTML
 */
interface IPageSourceOK {
    status: PageSourceStatus.OK;
    html: string;
}

/**
 * @interface IPageSourceNotFound Интерфейс при ошибке генерации HTML кода страницы
 * @param status    Внутренний статус генерации HTML
 * @param error     Ошибка, которая возникла при генерации HTML
 */
interface IPageSourceNotFound {
    status: PageSourceStatus.NOT_FOUND;
    error: Error;
}

type TPageSource = IPageSourceOK | IPageSourceNotFound;

/**
 * Интерфейс результата микропроцесса загрузки модуля - если модуль существует и его удалось загрузить
 */
interface IModuleFound {
    loadStatus: 'success';
    module: IModuleToRender;
}

/**
 * Интерфейс результата микропроцесса загрузки модуля - если модуля НЕ существует и его НЕ удалось загрузить
 */
interface IModuleNotFound {
    loadStatus: 'not_found';
    notFound: IPageSourceNotFound;
}

/**
 * Интерфейс успешного результата процесса загрузки модуля и предзагрузки данных
 */
interface IPageSourceDataOK {
    hasData: true;
    moduleName: string;
    dataToRender: Promise<unknown>;
}


/**
 * Интерфейс НЕ успешного результата процесса загрузки модуля и предзагрузки данных
 */
interface IPageSourceDataNotOK {
    hasData: false;
    notFound: IPageSourceNotFound;
}

export type TPageSourceData = IPageSourceDataOK | IPageSourceDataNotOK;

/**
 * Класс, который загружет модуль, который необходимо построить
 * и потом вызовет метод предзагрузки данных
 */
export class PageSourceData {
    constructor(private request: IServerRoutingRequest) {
        request.compatible = false;
    }

    /**
     * Загрузить модуль, вызвать метод предзагрузки данных
     * Вернет результат указанного типа
     * @returns
     */
    getResult(): TPageSourceData {
        const moduleName = MaskResolver.getAppNameByUrl(this.request.path);

        const loadResult: IModuleNotFound | IModuleFound = new ModuleLoader().load(moduleName);
        if (loadResult.loadStatus === 'not_found') {
            return {
                hasData: false,
                notFound: loadResult.notFound
            };
        }

        // TODO свойство isNewEnvironment будет пересмотрено
        // в https://online.sbis.ru/opendoc.html?guid=c28a34a5-54b2-4873-be99-f452189e64c0
        headDataStore.write('isNewEnvironment', true);

        const dataToRender: Promise<unknown> = new DataToRender().get(loadResult.module, this.request.path, moduleName);
        return {
            hasData: true,
            moduleName,
            dataToRender
        };
    }
}

/**
 * Класс для проверки существования модуля и его последующей загрузки
 */
class ModuleLoader {
    /**
     * Загрузка модуля, для которого будет построение страницы
     * @returns
     */
    load(moduleName: string): IModuleNotFound | IModuleFound {
        /** Нужно проверять наличие модуля, перед запросом через require.
         * Иначе будет уязвимость с производительностью, потому что могут передать в адресе мусор
         * https://online.sbis.ru/opendoc.html?guid=76a641dd-1f2a-497a-aa2b-a7f102da5735
         */
        if (!isModuleExists(moduleName)) {
            return {
                loadStatus: 'not_found',
                notFound: {
                    status: PageSourceStatus.NOT_FOUND,
                    error: new Error(`Модуля с названием ${moduleName} не существует.`)
                }
            };
        }

        const modulesManager = new ModulesManager();
        let module: IModuleToRender;
        try {
            module = modulesManager.loadSync(moduleName);
        } catch (error) {
            modulesManager.unloadSync(moduleName);
            return {
                loadStatus: 'not_found',
                notFound: {
                    status: PageSourceStatus.NOT_FOUND,
                    error
                }
            };
        }

        return {
            loadStatus: 'success',
            module
        };
    }
}

/**
 *
 */
class DataToRender {
    /**
     * предзагрузка данных для страницы
     * @param module
     * @param url
     */
    get(module: IModuleToRender, url: string, moduleName: string): Promise<unknown> {
        if (typeof module.getDataToRender !== 'function') {
            return Promise.resolve({});
        }

        // Promise для ограничения по времени вызов метода предзагрузки данных
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(reject, GET_DATA_TIMEOUT);
        });

        return Promise.race([module.getDataToRender(url), timeoutPromise])
            .then((pageConfig: unknown) => {
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

}

/**
 * Класс призван генерировать html-код страницы используя данные, полученные после работы класса PageSourceData
 */
export class PageSource {
    /**
     * Формирование итогового ответа с готовым html или с ошибкой
     * @param onSuccessHandler
     * @param onNotFoundHandler
     * @returns
     */
    render(options: IRenderOptions, renderData: TPageSourceData,
           onSuccessHandler: (html: string) => void, onNotFoundHandler: (error: Error) => void): Promise<unknown> {
        const pageSource: Promise<TPageSource> = this.renderPageSource(options, renderData);

        return pageSource
            .then((result: TPageSource) => {
                switch (result.status) {
                    case PageSourceStatus.OK:
                        onSuccessHandler(result.html);
                        break;
                    case PageSourceStatus.NOT_FOUND:
                    default:
                        onNotFoundHandler(result.error);
                }
                return result;
            });
    }

    /**
     * Вызов трехэтапного метода построения верстки используя предзагруженные данные
     * @param options
     * @param renderData
     * @returns Promise<IPageSource>
     */
    private renderPageSource(options: IRenderOptions, renderData: TPageSourceData): Promise<TPageSource> {
        if (renderData.hasData === false) {
            return Promise.resolve(renderData.notFound);
        }

        return renderData.dataToRender
            .then((pageConfig: unknown) => {
                options.pageConfig = pageConfig;
                return mainRender(renderData.moduleName, {application: renderData.moduleName, ...options});
            })
            .then((html) => {
                return({ status: PageSourceStatus.OK, html });
            });
    }
}
