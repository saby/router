import * as isModuleExists from 'RequireJsLoader/isModuleExists';
import * as UIDeps from 'UI/Deps';
import { logger } from 'Application/Env';
import { getPageSource } from 'Router/ServerRouting';
import {
    fakeRenderOptions,
    createFakeRequest,
    clearResponseWrapper,
} from 'RouterTest/ServerRouting/FakeRenderData';

jest.useFakeTimers();

describe('Router/ServerRouting', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        clearResponseWrapper();
    });

    it('построение несуществующего модуля', () => {
        const fakeRequest = createFakeRequest({ path: '/register' });
        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsStub = jest
            .spyOn(isModuleExists, 'default')
            .mockImplementation(jest.fn());
        const onSuccessHandler = jest.fn();
        const onNotFoundHandler = jest.fn();

        return getPageSource(
            fakeRenderOptions,
            fakeRequest,
            onSuccessHandler,
            onNotFoundHandler
        ).then((pageSource) => {
            // Должен быть вызван метод проверки существования модуля
            expect(isModuleExistsStub).toHaveBeenCalledTimes(2);
            expect(isModuleExistsStub).toHaveBeenCalledWith('register/Index');

            // Шаблон страницы не должен был построиться, т.к. модуль register/Index не существует
            expect(onSuccessHandler).not.toHaveBeenCalled();
            expect(onNotFoundHandler).toHaveBeenCalled();

            expect(pageSource).toHaveProperty('status');
            expect(pageSource).toHaveProperty('error');
        });
    });

    it('успешное построение страницы', () => {
        const fakeRequest = createFakeRequest({ path: '/RouterTest' });

        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsOrigin = isModuleExists.default.bind(isModuleExists);
        const isModuleExistsStub = jest
            .spyOn(isModuleExists, 'default')
            .mockImplementation((module) => {
                if (module.startsWith('RouterTest/Index')) {
                    return true;
                }

                return isModuleExistsOrigin(module);
            });
        const onSuccessHandler = jest.fn();
        const onNotFoundHandler = jest.fn();
        jest.spyOn(UIDeps, 'collectDependencies').mockReturnValue({
            scripts: new Set(),
            links: new Set(),
        });

        return getPageSource(
            fakeRenderOptions,
            fakeRequest,
            onSuccessHandler,
            onNotFoundHandler
        ).then((pageSource) => {
            // Должен быть вызван метод проверки существования модуля
            expect(isModuleExistsStub).toHaveBeenCalledTimes(2);
            expect(isModuleExistsStub).toHaveBeenCalledWith('RouterTest/Index');

            // Шаблон страницы должен был построиться
            expect(onSuccessHandler).toHaveBeenCalled();
            expect(onNotFoundHandler).not.toHaveBeenCalled();

            expect(pageSource).toHaveProperty('status');
            expect(pageSource).toHaveProperty('html');
        });
    });
});
