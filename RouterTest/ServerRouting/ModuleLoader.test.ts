import { assert } from 'chai';
import { createSandbox } from 'sinon';
import * as UIDeps from 'UICommon/Deps';
import { ModuleLoader } from 'Router/_ServerRouting/ModuleLoader';
import { IModuleNotFound, IModuleFound } from 'Router/_ServerRouting/Interfaces/IModuleLoader';
import { PageSourceStatus } from 'Router/_ServerRouting/Interfaces/IPageSource';


describe('Router/_ServerRouting/ModuleLoader', () => {
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

    it('загрузка несуществующего модуля', () => {
        const moduleName = 'Module/Index';
        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsStub = sandbox.stub(UIDeps, 'isModuleExists');
        const loadResult: IModuleNotFound | IModuleFound = new ModuleLoader().load(moduleName);

        sandbox.assert.calledOnce(isModuleExistsStub);  // Должен быть вызван метод проверки существования модуля
        assert.includeMembers(isModuleExistsStub.getCall(0).args, [moduleName],
                              'Некорректный вызов метода isModuleExists');
        assert.equal(loadResult.loadStatus, 'not_found', 'Некорректный статус загрузки модуля');
        if (loadResult.loadStatus === 'not_found') {
            assert.deepEqual(loadResult.notFound.status, PageSourceStatus.NOT_FOUND);
        }
    });

    it('загрузка существующего модуля', () => {
        const moduleName = 'RouterTest/Index';
        // заглушка метода проверки существования модуля, который строим
        const isModuleExistsStub = sandbox.stub(UIDeps, 'isModuleExists').withArgs(moduleName).returns(true);
        const loadResult: IModuleNotFound | IModuleFound = new ModuleLoader().load(moduleName);

        sandbox.assert.calledOnce(isModuleExistsStub);  // Должен быть вызван метод проверки существования модуля
        assert.includeMembers(isModuleExistsStub.getCall(0).args, [moduleName],
                              'Некорректный вызов метода isModuleExists');
        assert.equal(loadResult.loadStatus, 'success', 'Некорректный статус загрузки модуля');
        if (loadResult.loadStatus === 'success') {
            assert.equal(loadResult.module, require(moduleName));
        }
    });
});
