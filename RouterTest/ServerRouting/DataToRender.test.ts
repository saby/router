import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { DataToRender } from 'Router/_ServerRouting/DataToRender';
import { IModuleFound } from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import * as IndexModule from 'RouterTest/Index';


describe('Router/_ServerRouting/DataToRender', () => {
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

    it('вызов getDataToRender', () => {
        const moduleName = 'RouterTest/Index';
        const requestPath = '/url';

        const loadResult: IModuleFound = {loadStatus: 'success', module: IndexModule};
        // заглушка метода getDataToRender, чтобы он возвращал что нужно
        const getDataToRenderStub = sandbox.stub(loadResult.module, 'getDataToRender')
            .withArgs(requestPath).returns({url: requestPath});

        const dataToRender: Promise<unknown> = new DataToRender().get(loadResult.module, requestPath, moduleName);

        sandbox.assert.calledOnce(getDataToRenderStub);  // Должен быть вызван метод получения данных
        assert.includeMembers(getDataToRenderStub.getCall(0).args, [requestPath],
                              'Некорректный вызов метода getDataToRender');
        assert.instanceOf(dataToRender, Promise);
        return dataToRender
            .then((data: {url: string}) => {
                assert.isObject(data, 'Некорректный результат метода getDataToRender');
                assert.equal(data.url, requestPath, 'Некорректный результат метода getDataToRender');
            });
    });
});
