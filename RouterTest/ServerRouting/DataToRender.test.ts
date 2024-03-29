import { getRootRouter } from 'Router/router';
import { DataToRender } from 'Router/_ServerRouting/DataToRender';
import { IModuleFound } from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import { IDataToRenderNotExist } from 'Router/_ServerRouting/Interfaces/IPageSourceData';
import * as IndexModule from 'RouterTest/Index';

jest.useFakeTimers();

describe('Router/_ServerRouting/DataToRender', () => {
    const moduleName = 'RouterTest/Index';
    const requestPath = '/url';
    let Router;

    beforeEach(() => {
        Router = getRootRouter();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('вызов getDataToRender модуля', async () => {
        const loadResult: IModuleFound = {
            loadStatus: 'success',
            module: IndexModule,
        };
        const getDataToRenderOriginal = loadResult.module.getDataToRender.bind(
            loadResult.module
        );

        // заглушка метода getDataToRender, чтобы он возвращал что нужно
        const getDataToRenderStub = jest
            .spyOn(loadResult.module, 'getDataToRender')
            .mockImplementation((url) => {
                if (url === requestPath) {
                    return { url };
                }

                return getDataToRenderOriginal(url);
            });

        const dataToRender: Promise<unknown> = new DataToRender().get(
            loadResult.module,
            requestPath,
            moduleName,
            Router
        );

        // Должен быть вызван метод получения данных
        expect(getDataToRenderStub).toHaveBeenCalledTimes(1);
        expect(getDataToRenderStub).toHaveBeenCalledWith(
            requestPath,
            { prerender: false },
            Router
        );
        expect(dataToRender).toBeInstanceOf(Promise);

        return dataToRender.then((data: { url: string }) => {
            expect(data).toMatchObject({ url: requestPath });
        });
    });

    it('вызов статичного метода getDataToRender из default', async () => {
        // обнулим методы getDataToRender, как будто их нет
        jest.spyOn(IndexModule, 'getDataToRender');
        delete IndexModule.getDataToRender;

        const loadResult: IModuleFound = {
            loadStatus: 'success',
            module: IndexModule,
        };
        const getDataToRenderOriginal =
            loadResult.module.default.getDataToRender.bind(loadResult.module);

        // заглушка метода getDataToRender, чтобы он возвращал что нужно
        const getDataToRenderStub = jest
            .spyOn(loadResult.module.default, 'getDataToRender')
            .mockImplementation((url) => {
                if (url === requestPath) {
                    return { url };
                }

                return getDataToRenderOriginal(url);
            });

        const dataToRender: Promise<unknown> = new DataToRender().get(
            loadResult.module,
            requestPath,
            moduleName,
            Router
        );

        // Должен быть вызван метод получения данных
        expect(getDataToRenderStub).toHaveBeenCalledTimes(1);
        expect(getDataToRenderStub).toHaveBeenCalledWith(
            requestPath,
            { prerender: false },
            Router
        );
        expect(dataToRender).toBeInstanceOf(Promise);

        return dataToRender.then((data: { url: string }) => {
            expect(data).toMatchObject({ url: requestPath });
        });
    });

    it('у модуля нет метода getDataToRender', async () => {
        // обнулим методы getDataToRender, как будто их нет
        jest.spyOn(IndexModule, 'getDataToRender');
        delete IndexModule.getDataToRender;

        jest.spyOn(IndexModule.default, 'getDataToRender');
        delete IndexModule.default.getDataToRender;

        const loadResult: IModuleFound = {
            loadStatus: 'success',
            module: IndexModule,
        };

        const dataToRender: Promise<IDataToRenderNotExist | unknown> =
            new DataToRender().get(
                loadResult.module,
                requestPath,
                moduleName,
                Router
            );

        expect(dataToRender).toBeInstanceOf(Promise);

        return dataToRender.then((data: IDataToRenderNotExist) => {
            expect(data).toMatchObject({ getDataToRender: false });
        });
    });
});
