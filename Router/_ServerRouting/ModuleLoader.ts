import { logger, cookie, query } from 'Application/Env';
import { isModuleExists } from 'UI/Deps';
import { PageSourceStatus } from './Interfaces/IPageSource';
import {
    IModuleFound,
    IModuleLoadError,
    IModuleNotFound,
    IModuleToRender,
    ModuleLoadStatus,
} from './Interfaces/IModuleLoader';

const INDEX_CLIENT = '/Index';
const INDEX_SERVER = '/Index.server';

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
            moduleName: IndexPath,
            isRSC: isServerIndex,
        };
    }
}
