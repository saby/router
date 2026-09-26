import { logger } from 'Application/Env';
import { clearResponseWrapper, fakeRenderOptions } from 'RouterTest/ServerRouting/FakeRenderData';
import { PageRenderer, PartialPageRenderer } from 'Router/_Builder/_Bootstrap/PageRenderer';
import { PartialHtmlGenerator } from 'Router/_Builder/_Bootstrap/html/PartialHtmlGenerator';

jest.useFakeTimers();

describe('Router/_Builder/_Bootstrap/PageRenderer:PartialPageRenderer', () => {
    let pageRenderer: PartialPageRenderer;
    let renderStartSpy: jest.SpyInstance;
    let renderSpy: jest.SpyInstance;
    let renderEndSpy: jest.SpyInstance;
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation();
        pageRenderer = new PartialPageRenderer(fakeRenderOptions);
        renderStartSpy = jest
            .spyOn(PartialHtmlGenerator.prototype, 'renderStart')
            .mockReturnValue('renderStart');
        renderSpy = jest.spyOn(PartialHtmlGenerator.prototype, 'render').mockReturnValue('render');
        renderEndSpy = jest
            .spyOn(PartialHtmlGenerator.prototype, 'renderEnd')
            .mockReturnValue('renderEnd');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        clearResponseWrapper();
    });

    test('первый вызов renderPartial', () => {
        pageRenderer.renderPartial();

        expect(renderStartSpy).toHaveBeenCalledTimes(1);
        expect(renderSpy).not.toHaveBeenCalled();
        expect(renderEndSpy).not.toHaveBeenCalled();
    });

    test('два вызова renderPartial', () => {
        pageRenderer.renderPartial();
        pageRenderer.renderPartial();

        expect(renderStartSpy).toHaveBeenCalledTimes(1);
        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(renderEndSpy).not.toHaveBeenCalled();
    });

    test('вызов render после renderPartial', async () => {
        pageRenderer.renderPartial();
        pageRenderer.renderPartial();
        await pageRenderer.render('', fakeRenderOptions);

        expect(renderStartSpy).toHaveBeenCalledTimes(1);
        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(renderEndSpy).toHaveBeenCalledTimes(1);
    });

    test('вызов только render, без renderPartial', async () => {
        const _renderSpy = jest.spyOn(PageRenderer.prototype, 'render').mockImplementation();

        await pageRenderer.render('', fakeRenderOptions);

        expect(renderStartSpy).not.toHaveBeenCalled();
        expect(renderSpy).not.toHaveBeenCalled();
        expect(renderEndSpy).not.toHaveBeenCalled();
        expect(_renderSpy).toHaveBeenCalledTimes(1);
    });
});
