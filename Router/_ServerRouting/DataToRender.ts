/// <amd-module name="Router/_ServerRouting/DataToRender" />

import { logger } from 'Application/Env';
import { IModuleToRender } from './Interfaces/IModuleLoader';


// таймаут ожиданию предзагрузки данных для страницы
export const GET_DATA_TIMEOUT = 23000;

/**
 *
 */
export class DataToRender {
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
