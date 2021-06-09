import { assert } from 'chai';
import { createSandbox } from 'sinon';
import * as UIDeps from 'UICommon/Deps';
import { getAppName, getPageSource, IServerRoutingRequest } from 'Router/ServerRouting';
import { IRenderOptions } from 'Router/_Builder/_Bootstrap/Interface';


const fakeRenderOptions: IRenderOptions = {
   appRoot: '/',
   wsRoot: 'WS.Core',
   resourceRoot: '/',
   staticDomains: [],
   servicesPath: '/',
   pageConfig: {},
   doNotCheckModuleInContents: undefined
};

function createFakeRequest(path: string): IServerRoutingRequest {
   return {
      path,
      compatible: false
   };
}

describe('Router/ServerRouting', () => {
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

   it('получение имени модуля по URL адресу', () => {
      const fakeRequest = createFakeRequest('/register/?from=landing');
      assert.strictEqual(getAppName(fakeRequest), 'register/Index');
   });

   it('построение несуществующего модуля', (done) => {
      const fakeRequest = createFakeRequest('/register/?from=landing');
      // заглушка метода проверки существования модуля, который строим
      const isModuleExistsStub = sandbox.stub(UIDeps, 'isModuleExists');
      const onSuccessHandler = sandbox.stub();
      const onNotFoundHandler = sandbox.stub();
      getPageSource(fakeRenderOptions, fakeRequest, onSuccessHandler, onNotFoundHandler)
         .then((pageSource) => {
            sandbox.assert.calledOnce(isModuleExistsStub);  // Должен быть вызван метод проверки существования модуля
            assert.includeMembers(isModuleExistsStub.getCall(0).args, ['register/Index'],
                                  'Некорректный вызов метода isModuleExists');
            assert.isFalse(onSuccessHandler.called, 'Шаблон страницы не должен был построиться, ' +
                  'т.к. модуль register/Index не существует');
            assert.isTrue(onNotFoundHandler.called);
            assert.hasAllKeys(pageSource, ['status', 'error']);
         })
         .then(done, done);
   });

   it('успешное построение страницы', (done) => {
      const fakeRequest = createFakeRequest('/RouterTest/?from=landing');
      // заглушка метода проверки существования модуля, который строим
      const isModuleExistsStub = sandbox.stub(UIDeps, 'isModuleExists').withArgs('RouterTest/Index').returns(true);
      const onSuccessHandler = sandbox.stub();
      const onNotFoundHandler = sandbox.stub();
      getPageSource(fakeRenderOptions, fakeRequest, onSuccessHandler, onNotFoundHandler)
         .then((pageSource) => {
            sandbox.assert.calledOnce(isModuleExistsStub);  // Должен быть вызван метод проверки существования модуля
            assert.includeMembers(isModuleExistsStub.getCall(0).args, ['RouterTest/Index'],
                                  'Некорректный вызов метода isModuleExists');
            assert.isTrue(onSuccessHandler.called, 'Шаблон страницы должен был построиться');
            assert.isFalse(onNotFoundHandler.called);
            assert.hasAllKeys(pageSource, ['status', 'html']);
         })
         .then(done, done);
   });
});
