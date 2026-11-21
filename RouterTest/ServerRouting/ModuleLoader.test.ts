import * as isModuleExists from 'RequireJsLoader/isModuleExists';
import { logger } from 'Application/Env';
import { ModuleLoader } from 'Router/_ServerRouting/ModuleLoader';
import {
    IModuleNotFound,
    IModuleFound,
    IModuleLoadError,
    ModuleLoadStatus,
} from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import { PageSourceStatus } from 'Router/_ServerRouting/Interfaces/IPageSource';

jest.useFakeTimers();

describe('Router/_ServerRouting/ModuleLoader', () => {
    beforeEach(() => {
        const loggerInfo = logger.info;
        jest.spyOn(logger, 'info').mockImplementation((...args) => {
            if (args[0] && args[0].startsWith('RSC:')) {
                return;
            }
            loggerInfo(...args);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('загрузка несуществующего модуля', () => {
        const s3mod = 'Module';

        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsStub = jest.spyOn(isModuleExists, 'default').mockReturnValue(false);
        const loadResult: IModuleNotFound | IModuleFound | IModuleLoadError =
            new ModuleLoader().load(s3mod);

        // Должен быть вызван метод проверки существования модуля
        expect(isModuleExistsStub).toHaveBeenCalledTimes(2);
        expect(isModuleExistsStub).toHaveBeenCalledWith(s3mod + '/Index');
        expect(isModuleExistsStub).toHaveBeenCalledWith(s3mod + '/Index.server');
        expect(loadResult.loadStatus).toEqual(ModuleLoadStatus.NOT_FOUND);
        expect((loadResult as IModuleNotFound).notFound.status).toEqual(PageSourceStatus.NOT_FOUND);
    });

    it('загрузка существующего модуля', () => {
        const s3mod = 'RouterTest';
        const moduleName = s3mod + '/Index';

        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsOriginal = isModuleExists.default.bind(isModuleExists);
        const isModuleExistsStub = jest
            .spyOn(isModuleExists, 'default')
            .mockImplementation((name) => {
                if (name.startsWith(moduleName)) {
                    return true;
                }
                if (name === s3mod + '/getDataToRender') {
                    return false;
                }

                return isModuleExistsOriginal(name);
            });
        const loadResult: IModuleNotFound | IModuleFound | IModuleLoadError =
            new ModuleLoader().load(s3mod);

        // Должен быть вызван метод проверки существования модуля
        expect(isModuleExistsStub).toHaveBeenCalledWith(moduleName);
        expect(isModuleExistsStub).toHaveBeenCalledWith(s3mod + '/getDataToRender');
        // RouterTest/Index, RouterTest/Index.server, RouterTest/getDataToRender
        expect(isModuleExistsStub).toHaveBeenCalledTimes(3);
        expect(loadResult.loadStatus).toEqual(ModuleLoadStatus.SUCCESS);
        expect((loadResult as IModuleFound).module).toEqual(
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require(moduleName)
        );
        // отдельного модуля getDataToRender нет - поле не заполнено
        expect((loadResult as IModuleFound).getDataToRenderModule).toBeUndefined();
    });

    it('если нет Index, отдельный getDataToRender не ищется', () => {
        const s3mod = 'Module';

        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsStub = jest.spyOn(isModuleExists, 'default').mockReturnValue(false);
        new ModuleLoader().load(s3mod);

        // getDataToRender не проверяется, так как нет Index
        expect(isModuleExistsStub).not.toHaveBeenCalledWith(s3mod + '/getDataToRender');
    });

    it('загрузка существующего модуля с отдельным getDataToRender', () => {
        const s3mod = 'RouterTest/GetDataRender';

        jest.spyOn(isModuleExists, 'default').mockReturnValue(true);

        const loadResult: IModuleNotFound | IModuleFound | IModuleLoadError =
            new ModuleLoader().load(s3mod);

        expect(loadResult.loadStatus).toEqual(ModuleLoadStatus.SUCCESS);
        expect((loadResult as IModuleFound).module).toBeDefined();
        // отдельный модуль getDataToRender найден и загружен
        expect((loadResult as IModuleFound).getDataToRenderModule).toBeDefined();
        expect(typeof (loadResult as IModuleFound).getDataToRenderModule?.default).toBe('function');
    });
});
