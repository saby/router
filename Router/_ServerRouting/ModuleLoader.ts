import { logger } from 'Application/Env';
import { isModuleExists } from 'UI/Deps';
import { PageSourceStatus } from './Interfaces/IPageSource';
import {
    IModuleFound,
    IModuleLoadError,
    IModuleNotFound,
    IModuleToRender,
    ModuleLoadStatus,
} from './Interfaces/IModuleLoader';

/**
 * Класс для проверки существования модуля и его последующей загрузки
 * @private
 */
export class ModuleLoader {
    /**
     * Загрузка модуля, для которого будет построение страницы
     */
    load(moduleName: string): IModuleNotFound | IModuleFound | IModuleLoadError {
        /* Нужно проверять наличие модуля, перед запросом через require.
         * Иначе будет уязвимость с производительностью, потому что могут передать в адресе мусор
         * https://online.sbis.ru/opendoc.html?guid=76a641dd-1f2a-497a-aa2b-a7f102da5735
         */
        if (!isModuleExists(moduleName)) {
            return {
                loadStatus: ModuleLoadStatus.NOT_FOUND,
                notFound: {
                    status: PageSourceStatus.NOT_FOUND,
                    error: new Error(`Модуля с названием ${moduleName} не существует.`),
                },
            };
        }

        let module: IModuleToRender;
        try {
            module = requirejs(moduleName);
        } catch (error) {
            requirejs.undef(moduleName);
            logger.error('Router/ModuleLoader', 'Ошибка при загрузке модуля ' + moduleName, error);
            return {
                loadStatus: ModuleLoadStatus.ERROR,
                notFound: {
                    status: PageSourceStatus.ERROR,
                    error: error as Error,
                },
            };
        }

        if (!module) {
            const error = new Error(
                `Require вернул undefined при загрузке модуля ${moduleName}.` +
                    'Необходимо проверить модуль на предмет циклической зависимости.'
            );
            logger.error('Router/ModuleLoader', 'Ошибка при загрузке модуля ' + moduleName, error);
            // в этой точке модуля может не быть, если в нём есть циклическая зависимость
            return {
                loadStatus: ModuleLoadStatus.ERROR,
                notFound: {
                    status: PageSourceStatus.ERROR,
                    error,
                },
            };
        }

        return {
            loadStatus: ModuleLoadStatus.SUCCESS,
            module,
        };
    }
}
