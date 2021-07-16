import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { DataToRender } from 'Router/_ServerRouting/DataToRender';
import { IModuleFound } from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import { IDataToRenderNotExist } from 'Router/_ServerRouting/Interfaces/IPageSourceData';
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

    it('у модуля нет метода getDataToRender', () => {
        const moduleName = 'RouterTest/Index';
        const requestPath = '/url';

        const loadResult: IModuleFound = {loadStatus: 'success', module: IndexModule};
        // удалим метод getDataToRender, как будто его нет
        delete loadResult.module.getDataToRender;

        const dataToRender: Promise<IDataToRenderNotExist | unknown> =
            new DataToRender().get(loadResult.module, requestPath, moduleName);

        assert.instanceOf(dataToRender, Promise);
        return dataToRender
            .then((data: IDataToRenderNotExist) => {
                assert.isObject(data, 'Некорректный результат метода getDataToRender');
                assert.equal(data.getDataToRender, false, 'Некорректный результат при несуществующем методе getDataToRender');
            });
    });
});
