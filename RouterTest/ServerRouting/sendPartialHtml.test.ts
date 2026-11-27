import {
    clearResponseWrapper,
    createFakeResponse,
    fakeRenderOptions,
} from 'RouterTest/ServerRouting/FakeRenderData';
import {
    disablePartialSend,
    initResponseWrapper,
    isPartialHtmlSent,
    sendPartialHtml,
} from 'Router/ServerRouting';
import { logger } from 'Application/Env';
import { initPageRenderer } from 'Router/Builder';
import { PartialPageRenderer } from 'Router/_Builder/_Bootstrap/PageRenderer';
import { IModuleFound, ModuleLoadStatus } from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import {
    disableAsyncRenderAndSend,
    getPartialRenderMode,
} from 'Router/_ServerRouting/ResponseWrapper';

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
        jest.restoreAllMocks();
        clearResponseWrapper();
    });

    test('старый роутинг не требует PageRenderer для состояния ответа', () => {
        const warnSpy = jest.spyOn(logger, 'warn').mockImplementation();
        initResponseWrapper(createFakeResponse(true), false);

        expect(isPartialHtmlSent()).toBe(false);
        expect(getPartialRenderMode()).toBe(false);
        expect(() => disablePartialSend()).not.toThrow();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('режим частичного рендера берется из ResponseWrapper', () => {
        initResponseWrapper(createFakeResponse(true));

        expect(getPartialRenderMode()).toBe(true);
    });

    test('потоковое построение не включено на уровне сервиса', () => {
        const res = createFakeResponse();
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res);
        initPageRenderer(!!res.stream_response, fakeRenderOptions, SUCCESS_MODULE_LOADED);

        sendPartialHtml();

        expect(sendSpy).not.toHaveBeenCalled();
    });

    test('потоковое построение', () => {
        const res = createFakeResponse(true);
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res);
        initPageRenderer(!!res.stream_response, fakeRenderOptions, SUCCESS_MODULE_LOADED);

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
        initResponseWrapper(res);
        initPageRenderer(!!res.stream_response, fakeRenderOptions, SUCCESS_MODULE_LOADED);

        const renderPartialSpy = jest
            .spyOn(PartialPageRenderer.prototype, 'renderPartial')
            .mockImplementation();

        disablePartialSend();
        sendPartialHtml();

        expect(renderPartialSpy).not.toHaveBeenCalled();
        expect(sendSpy).not.toHaveBeenCalled();
    });
});
