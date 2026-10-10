import * as isModuleExists from 'RequireJsLoader/isModuleExists';
import { logger } from 'Application/Env';
import { IRouter, getRootRouter } from 'Router/router';
import { PageSourceData } from 'Router/_ServerRouting/PageSourceData';
import * as IndexModule from 'RouterTest/Index';
import { PageSourceStatus } from 'Router/_ServerRouting/Interfaces/IPageSource';
import { TPageSourceData } from 'Router/_ServerRouting/Interfaces/IPageSourceData';
import {
    clearResponseWrapper,
    createFakeRequest,
    createFakeResponse,
    fakeRenderOptions,
} from 'RouterTest/ServerRouting/FakeRenderData';
import * as ResponseWrapper from 'Router/_ServerRouting/ResponseWrapper';

jest.useFakeTimers();

describe('Router/_ServerRouting/PageSourceData', () => {
    let Router: IRouter;

    beforeEach(() => {
        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsOriginal = isModuleExists.default.bind(isModuleExists);
        jest.spyOn(isModuleExists, 'default').mockImplementation((module) => {
            if (module.startsWith('RouterTest/Index')) {
                // проходит RouterTest/Index и RouterTest/Index.server
                return true;
            }
            if (module.startsWith('register/Index')) {
                // проходит register/Index и register/Index.server
                return false;
            }
            return isModuleExistsOriginal(module);
        });

        Router = getRootRouter();
        jest.spyOn(ResponseWrapper, 'sendPartialHtml').mockImplementation();

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
        clearResponseWrapper();
    });

    it('получение результата для несуществующего модуля', async () => {
        const fakeRequest = createFakeRequest({ path: '/register' });
        const renderData: TPageSourceData = await new PageSourceData(fakeRequest).getResult(
            {
                ...fakeRenderOptions,
                Router,
            },
            createFakeResponse()
        );

        expect(renderData.hasData).toBe(false);
        if (renderData.hasData === false) {
            expect(renderData.notFound.status).toEqual(PageSourceStatus.NOT_FOUND);
        }
    });

    it('получение результата для существующего модуля', async () => {
        const fakeRequest = createFakeRequest({ path: '/RouterTest' });

        const renderData: TPageSourceData = await new PageSourceData(fakeRequest).getResult(
            {
                ...fakeRenderOptions,
                Router,
            },
            createFakeResponse()
        );

        expect(renderData.hasData).toBe(true);
        if (renderData.hasData === true) {
            expect(renderData.moduleName).toBe('RouterTest/Index');
            expect(renderData.dataToRender).toBeInstanceOf(Promise);
        }
    });

    it('передача req.url в метод getDataToRender', async () => {
        const fakeRequest = createFakeRequest({
            path: '/RouterTest',
            originalUrl: '/service/RouterTest/?from=landing',
            url: '/RouterTest/?from=landing',
            baseUrl: '/service',
        });

        // заглушка метода getDataToRender, чтобы проверить как он был вызван
        const getDataToRenderStub = jest.spyOn(IndexModule, 'getDataToRender');

        await new PageSourceData(fakeRequest).getResult(
            {
                ...fakeRenderOptions,
                Router,
            },
            createFakeResponse()
        );

        // Должен быть вызван метод получения данных
        expect(getDataToRenderStub).toHaveBeenCalledTimes(1);
        expect(getDataToRenderStub).toHaveBeenCalledWith(
            fakeRequest.url,
            expect.objectContaining({ ...fakeRenderOptions, Router }),
            Router
        );
    });

    describe('404 при попытке построить файл вместо пути', () => {
        it('.js в конце пути', async () => {
            const fakeRequest = createFakeRequest({ path: '/RouterTest/Env/Env.js' });

            const renderData: TPageSourceData = await new PageSourceData(fakeRequest).getResult(
                {
                    ...fakeRenderOptions,
                    Router,
                },
                createFakeResponse()
            );

            expect(renderData.hasData).toBe(false);
            if (renderData.hasData === false) {
                expect(renderData.notFound.status).toEqual(PageSourceStatus.NOT_FOUND);
            }
        });

        it('/json в конце пути не "ломает" построение страницы', async () => {
            const fakeRequest = createFakeRequest({ path: '/RouterTest/Env/Env/json' });

            const renderData: TPageSourceData = await new PageSourceData(fakeRequest).getResult(
                {
                    ...fakeRenderOptions,
                    Router,
                },
                createFakeResponse()
            );

            expect(renderData.hasData).toBe(true);
        });
    });
});
