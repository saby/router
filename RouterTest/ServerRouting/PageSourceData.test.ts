import { assert } from 'chai';
import { createSandbox } from 'sinon';
import * as UIDeps from 'UICommon/Deps';
import { PageSourceData } from 'Router/_ServerRouting/PageSourceData';
import { PageSourceStatus } from 'Router/_ServerRouting/Interfaces/IPageSource';
import { TPageSourceData } from 'Router/_ServerRouting/Interfaces/IPageSourceData';
import { createFakeRequest } from 'RouterTest/ServerRouting/FakeRenderData';


describe('Router/_ServerRouting/PageSourceData', () => {
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

    it('получение результата для несуществующего модуля', () => {
        const fakeRequest = createFakeRequest('/register/?from=landing');
        const renderData: TPageSourceData = new PageSourceData(fakeRequest).getResult();

        assert.equal(renderData.hasData, false, 'Некорректный статус получения данные для построения');
        if (renderData.hasData === false) {
            assert.deepEqual(renderData.notFound.status, PageSourceStatus.NOT_FOUND);
        }
    });

    it('получение результата для существующего модуля', () => {
        const fakeRequest = createFakeRequest('/RouterTest/?from=landing');
        // заглушка метода проверки существования модуля, который строим
        sandbox.stub(UIDeps, 'isModuleExists').withArgs('RouterTest/Index').returns(true);

        const renderData: TPageSourceData = new PageSourceData(fakeRequest).getResult();

        assert.equal(renderData.hasData, true, 'Некорректный статус получения данные для построения');
        if (renderData.hasData === true) {
            assert.deepEqual(renderData.moduleName, 'RouterTest/Index');
            assert.instanceOf(renderData.dataToRender, Promise);
        }
    });
});
