import {
    clearResponseWrapper,
    createFakeResponse,
    fakeRenderOptions,
} from 'RouterTest/ServerRouting/FakeRenderData';
import { disablePartialSend, initResponseWrapper, sendPartialHtml } from 'Router/ServerRouting';
import { PartialPageRenderer } from 'Router/_Builder/_Bootstrap/PageRenderer';

jest.useFakeTimers();

describe('Router/_ServerRouting/ResponseWrapper:sendPartialHtml', () => {
    afterEach(() => {
        clearResponseWrapper();
    });

    test('потоковое построение не включено на уровне сервиса', () => {
        const res = createFakeResponse();
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res, fakeRenderOptions);

        sendPartialHtml();

        expect(sendSpy).not.toHaveBeenCalled();
    });

    test('потоковое построение', () => {
        const res = createFakeResponse(true);
        const sendSpy = jest.spyOn(res, 'send').mockImplementation();
        initResponseWrapper(res, fakeRenderOptions);
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
        initResponseWrapper(res, fakeRenderOptions);
        const renderPartialSpy = jest
            .spyOn(PartialPageRenderer.prototype, 'renderPartial')
            .mockImplementation();

        disablePartialSend();
        sendPartialHtml();

        expect(renderPartialSpy).not.toHaveBeenCalled();
        expect(sendSpy).not.toHaveBeenCalled();
    });
});
