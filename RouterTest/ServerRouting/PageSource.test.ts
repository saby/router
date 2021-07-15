import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { PageSource } from 'Router/_ServerRouting/PageSource';
import { IPageSourceDataOK, IPageSourceDataNotOK } from 'Router/_ServerRouting/Interfaces/IPageSourceData';
import { PageSourceStatus } from 'Router/_ServerRouting/Interfaces/IPageSource';
import { fakeRenderOptions } from 'RouterTest/ServerRouting/FakeRenderData';


describe('Router/_ServerRouting/PageSource', () => {
    let sandbox;

    before(function (): void {
        if (typeof window !== 'undefined') {
            this.skip();
        }
    });

    beforeEach(() => {
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('построение несуществующего модуля', () => {
        const renderData: IPageSourceDataNotOK = {
            hasData: false,
            notFound: {
                status: PageSourceStatus.NOT_FOUND,
                error: new Error()
            }
        };
        const onSuccessHandler = sandbox.stub();
        const onNotFoundHandler = sandbox.stub();

        return new PageSource().render(fakeRenderOptions, renderData, onSuccessHandler, onNotFoundHandler)
            .then((pageSource) => {
                assert.isFalse(onSuccessHandler.called, 'Шаблон страницы не должен был построиться, ' +
                    'т.к. модуль register/Index не существует');
                assert.isTrue(onNotFoundHandler.called);
                assert.hasAllKeys(pageSource, ['status', 'error']);
            });
    });

    it('успешное построение страницы', () => {
        const renderData: IPageSourceDataOK = {
            hasData: true,
            dataToRender: Promise.resolve({}),
            moduleName: 'RouterTest/Index'
        };
        const onSuccessHandler = sandbox.stub();
        const onNotFoundHandler = sandbox.stub();

        return new PageSource().render(fakeRenderOptions, renderData, onSuccessHandler, onNotFoundHandler)
            .then((pageSource) => {
                assert.isTrue(onSuccessHandler.called, 'Шаблон страницы должен был построиться');
                assert.isFalse(onNotFoundHandler.called);
                assert.hasAllKeys(pageSource, ['status', 'html']);
            });
    });
});
