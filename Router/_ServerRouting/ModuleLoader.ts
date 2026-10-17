import isModuleExists from 'RequireJsLoader/isModuleExists';
import { logger, cookie, query } from 'Application/Env';
import { PageSourceStatus } from './Interfaces/IPageSource';
import {
    IGetDataToRenderModule,
    IModuleFound,
    IModuleLoadError,
    IModuleNotFound,
    IModuleToRender,
    ModuleLoadStatus,
} from './Interfaces/IModuleLoader';

const INDEX_CLIENT = '/Index';
const INDEX_SERVER = '/Index.server';
const GET_DATA_TO_RENDER = '/getDataToRender';

/**
 * Класс для проверки существования модуля и его последующей загрузки
 * @private
 */
export class ModuleLoader {
    /**
     * Загрузка модуля, для которого будет построение страницы
     */
    load(s3modName: string): IModuleNotFound | IModuleFound | IModuleLoadError {
        // MyModule/Index
        const clientIndex = s3modName + INDEX_CLIENT;
        // MyModule/Index.server
        const serverIndex = s3modName + INDEX_SERVER;
        /* Нужно проверять наличие модуля, перед запросом через require.
         * Иначе будет уязвимость с производительностью, потому что могут передать в адресе мусор
         * https://online.sbis.ru/opendoc.html?guid=76a641dd-1f2a-497a-aa2b-a7f102da5735
         */
        const isClientIndexExists = isModuleExists(clientIndex);
        const isServerIndexExists = isModuleExists(serverIndex);
        if (!isClientIndexExists && !isServerIndexExists) {
            return {
                loadStatus: ModuleLoadStatus.NOT_FOUND,
                notFound: {
                    status: PageSourceStatus.NOT_FOUND,
                    error: new Error(`В модуле ${s3modName} не существует Index файла.`),
                },
            };
        }

        // Если есть оба Index файла, то в приоритете берём клиентский Index
        // Но можно принудительно построить серверный Index используя query-параметр isRSC = true или
        // локально на wasaby-cli куку isRSC = true
        const isServerIndex =
            isServerIndexExists &&
            (!isClientIndexExists || query.get.isRSC === 'true' || cookie.get('isRSC') === 'true');
        const IndexPath = isServerIndex ? serverIndex : clientIndex;
        logger.info('RSC: IndexPath: ' + IndexPath);

        let module: IModuleToRender;
        try {
            module = requirejs(IndexPath);
        } catch (error) {
            requirejs.undef(IndexPath);
            logger.error('Router/ModuleLoader', 'Ошибка при загрузке модуля ' + IndexPath, error);
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
                `Require вернул undefined при загрузке модуля ${IndexPath}.` +
                    'Необходимо проверить модуль на предмет циклической зависимости.'
            );
            logger.error('Router/ModuleLoader', 'Ошибка при загрузке модуля ' + IndexPath, error);
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
            getDataToRenderModule: this.loadGetDataToRenderModule(s3modName),
            moduleName: IndexPath,
            isRSC: isServerIndex,
        };
    }

    /**
     * Загрузка отдельного модуля с методом precharge данных getDataToRender (MyModule/getDataToRender).
     * Метод в этом модуле должен быть default-экспортом.
     * Отсутствие файла или ошибка при его загрузке не должны ломать построение страницы,
     * в таком случае просто возвращаем undefined и поиск метода идет по старой логике (в Index).
     */
    private loadGetDataToRenderModule(s3modName: string): IGetDataToRenderModule | undefined {
        const getDataToRenderPath = s3modName + GET_DATA_TO_RENDER;
        let getDataToRenderModule: IGetDataToRenderModule;
        try {
            if (!isModuleExists(getDataToRenderPath)) {
                return undefined;
            }

            getDataToRenderModule = requirejs(getDataToRenderPath);
            logger.info('RSC: getDataToRenderPath: ' + getDataToRenderPath);
        } catch (error) {
            requirejs.undef(getDataToRenderPath);
            logger.error(
                'Router/ModuleLoader',
                'Ошибка при загрузке модуля ' + getDataToRenderPath,
                error
            );
            return undefined;
        }
        if (!getDataToRenderModule) {
            const error = new Error(
                `Require вернул undefined при загрузке модуля ${getDataToRenderPath}.` +
                    'Необходимо проверить модуль на предмет циклической зависимости.'
            );
            logger.error(
                'Router/ModuleLoader',
                'Ошибка при загрузке модуля ' + getDataToRenderPath,
                error
            );
            // в этой точке модуля может не быть, если в нём есть циклическая зависимость
            return undefined;
        }
        return getDataToRenderModule;
    }
}
