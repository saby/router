/// <amd-module name="Router/_ServerRouting/Render" />
/**
 * Классы для рендеринга страницы
 * @author Мустафин Л.И.
 */

 import { ModulesManager } from 'RequireJsLoader/conduct';
 import { MaskResolver } from 'Router/router';
 import { logger } from 'Application/Env';
 import { headDataStore, isModuleExists } from 'UICommon/Deps';
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
 * Тип данных, которые получим привызове метода предзагрузки данных
 */
export type TDataToRender = {};

export interface IRenderPageData {
    moduleName: string;
    dataToRender: Promise<TDataToRender>;
    notFound: IPageSource;
}

/**
 * Класс, который загружет модуль, который необходимо построить
 * и потом вызовет метод предзагрузки данных
 */
export class DataToRender {
    private moduleName: string;
    private notFound: IPageSource;
    private dataToRender: Promise<TDataToRender>;

    constructor(request: IServerRoutingRequest) {
        request.compatible = false;
        this.moduleName = MaskResolver.getAppNameByUrl(request.path);
        this.process(request.path);
    }

    /**
     * Получить результат предзагрузки данных
     * @returns
     */
    getResult(): IRenderPageData {
        return {
            moduleName: this.moduleName,
            dataToRender: this.dataToRender,
            notFound: this.notFound
        };
    }

    /**
     * Процесс загрузки модуля и вызова предзагрузки данных
     * @param requestPath
     * @returns
     */
    private process(requestPath: string): void {
        const module: IModuleToRender = this.requireModule();
        if (!module) {
            return;
        }

        // TODO свойство isNewEnvironment будет пересмотрено
        // в https://online.sbis.ru/opendoc.html?guid=c28a34a5-54b2-4873-be99-f452189e64c0
        headDataStore.write('isNewEnvironment', true);

        this.dataToRender = this.getDataToRender(module, requestPath);
    }

    /**
     * Загрузка модуля, для которого будет построение страницы
     * @returns
     */
     private requireModule(): IModuleToRender | undefined {
        /** Нужно проверять наличие модуля, перед запросом через require.
         * Иначе будет уязвимость с производительностью, потому что могут передать в адресе мусор
         * https://online.sbis.ru/opendoc.html?guid=76a641dd-1f2a-497a-aa2b-a7f102da5735
         */
        if (!isModuleExists(this.moduleName)) {
            this.notFound = {
                status: PageSourceStatus.NOT_FOUND,
                error: new Error(`Модуля с названием ${this.moduleName} не существует.`)
            };
            return;
        }

        const modulesManager = new ModulesManager();
        let module: IModuleToRender;
        try {
            module = modulesManager.loadSync(this.moduleName);
        } catch (error) {
            modulesManager.unloadSync(this.moduleName);
            this.notFound = {
                status: PageSourceStatus.NOT_FOUND,
                error
            };
            return;
        }

        return module;
    }

    /**
     * предзагрузка данных для страницы
     * @param module
     * @param url
     * @return {} если нет метода для предзагрузки данных или сам метод предзагрузки данных может вернуть false
     *         TDataToRender тогда это новый способ построения страницы (от div)
     */
     private getDataToRender(module: IModuleToRender, url: string): Promise<TDataToRender> {
        if (typeof module.getDataToRender !== 'function') {
            return Promise.resolve({});
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
                        `Error when loading data for module ${this.moduleName}: ` + err.message, err);
                } else {
                    timeoutError = new Error(`Timeout error while loading data for module ${this.moduleName}, url: ${url}`);
                    logger.warn('Router/ServerRouting', timeoutError.message);
                }
                return {error: err || timeoutError};
            });
    }

}

/**
 * Класс призван генерировать html-код страницы используя данные, полученные после работы класса DataToRender
 */
export class PageSource {
    private pageSource: Promise<IPageSource>;

    constructor(options: IRenderOptions, renderData: IRenderPageData) {
        this.pageSource = this.renderPageSource(options, renderData);
    }

    /**
     * Формирование итогового ответа с готовым html или с ошибкой
     * @param onSuccessHandler
     * @param onNotFoundHandler
     * @returns
     */
    render(onSuccessHandler: (html: string) => void, onNotFoundHandler: (error: Error) => void): Promise<unknown> {
        return this.pageSource
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
     * Вызов трехэтапного метода построения верстки используя предзагруженные данные
     * @param options
     * @param renderData
     * @returns Promise<IPageSource>
     */
    private renderPageSource(options: IRenderOptions, renderData: IRenderPageData): Promise<IPageSource> {
        if (renderData.notFound) {
            return Promise.resolve(renderData.notFound);
        }

        return renderData.dataToRender
            .then((pageConfig: object | false) => {
                options.pageConfig = pageConfig;
                return mainRender(renderData.moduleName, {application: renderData.moduleName, ...options});
            })
            .then((html) => {
                return({ status: PageSourceStatus.OK, html });
            });
    }
}
