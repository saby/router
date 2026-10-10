import { logger } from 'Application/Env';
import { IRouter } from 'Router/router';
import { IRenderOptions } from 'Router/Builder';
import { IGetDataToRenderModule, IModuleToRender } from './Interfaces/IModuleLoader';
import { IDataToRenderNotExist } from './Interfaces/IPageSourceData';

// таймаут ожиданию предзагрузки данных для страницы
export const GET_DATA_TIMEOUT = 23000;

/**
 *
 * @private
 */
export class DataToRender {
    /**
     * предзагрузка данных для страницы
     * @param module
     * @param url
     * @param moduleName
     * @param options
     * @param getDataToRenderModule отдельный модуль MyModule/getDataToRender (метод как default-экспорт)
     */
    get(
        module: IModuleToRender,
        url: string,
        moduleName: string,
        options: IRenderOptions,
        getDataToRenderModule?: IGetDataToRenderModule
    ): Promise<IDataToRenderNotExist | unknown> {
        // Сначала ищем метод в отдельном файле getDataToRender.js как default-экспорт.
        // Если файла нет или в нём нет default, падаем на старую логику (метод в Index).
        const getDataToRender =
            (typeof getDataToRenderModule?.default === 'function'
                ? getDataToRenderModule.default
                : undefined) ??
            module.getDataToRender ??
            module.default?.getDataToRender;
        if (typeof getDataToRender !== 'function') {
            return Promise.resolve({ getDataToRender: false });
        }

        // Promise для ограничения по времени вызов метода предзагрузки данных
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(reject, GET_DATA_TIMEOUT);
        });

        return Promise.race([
            getDataToRender(url, { ...options }, options.Router as IRouter),
            timeoutPromise,
        ])
            .then((pageConfig: unknown) => {
                return pageConfig;
            })
            .catch((error) => {
                if (error) {
                    logger.error(
                        'Router/ServerRouting',
                        `Error when loading data for module ${moduleName}: ` + error.message,
                        error
                    );
                } else {
                    error = new Error(
                        `Timeout error while loading data for module ${moduleName}, url: ${url}`
                    );
                    logger.warn('Router/ServerRouting', error.message);
                }
                return { error };
            });
    }
}
