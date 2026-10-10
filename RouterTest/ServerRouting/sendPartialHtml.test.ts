import {
    clearResponseWrapper,
    createFakeResponse,
    fakeRenderOptions,
} from 'RouterTest/ServerRouting/FakeRenderData';
import { disablePartialSend, initResponseWrapper, sendPartialHtml } from 'Router/ServerRouting';
import { PartialPageRenderer } from 'Router/_Builder/_Bootstrap/PageRenderer';
import { IModuleFound, ModuleLoadStatus } from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import { disableAsyncRenderAndSend } from 'Router/_ServerRouting/ResponseWrapper';

jest.useFakeTimers();

const SUCCESS_MODULE_LOADED: IModuleFound = {
    loadStatus: ModuleLoadStatus.SUCCESS,
    module: { default: () => {} },
    isRSC: false,
    moduleName: 'RouterTest/Index',
};

describe('Router/_ServerRouting/ResponseWrapper:sendPartialHtml', () => {
    beforeEach(() => {
        disableAsyncRenderAndSend();
    });

    afterEach(() => {
        clearResponseWrapper();
    });

    test('потоковое построение не включено на уровне сервиса', () => {
        const res = createFakeResponse();
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res, fakeRenderOptions, SUCCESS_MODULE_LOADED);

        sendPartialHtml();

        expect(sendSpy).not.toHaveBeenCalled();
    });

    test('потоковое построение', () => {
        const res = createFakeResponse(true);
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res, fakeRenderOptions, SUCCESS_MODULE_LOADED);
        const renderPartialSpy = jest
            .spyOn(PartialPageRenderer.prototype, 'renderPartial')
            .mockImplementation(() => 'html string');

        sendPartialHtml();

        expect(renderPartialSpy).toHaveBeenCalledTimes(1);
        expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    test('отключение потокового построения', () => {
        const res = createFakeResponse(true);
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res, fakeRenderOptions, SUCCESS_MODULE_LOADED);
        const renderPartialSpy = jest
            .spyOn(PartialPageRenderer.prototype, 'renderPartial')
            .mockImplementation();

        disablePartialSend();
        sendPartialHtml();

        expect(renderPartialSpy).not.toHaveBeenCalled();
        expect(sendSpy).not.toHaveBeenCalled();
    });
});
