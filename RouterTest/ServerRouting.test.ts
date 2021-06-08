import { assert } from 'chai';
import { stub } from 'sinon';
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
   before(function (): void {
      if (typeof window !== 'undefined') {
         this.skip();
      }
   });
   it('получение имени модуля по URL адресу', () => {
      const fakeRequest = createFakeRequest('/register/?from=landing');
      assert.strictEqual(getAppName(fakeRequest), 'register/Index');
   });

   it('построение несуществующего модуля', (done) => {
      const fakeRequest = createFakeRequest('/register/?from=landing');
      const onSuccessHandler = stub();
      const onNotFoundHandler = stub();
      getPageSource(fakeRenderOptions, fakeRequest, onSuccessHandler, onNotFoundHandler)
         .then((pageSource) => {
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
      const isModuleExistsStub = stub(UIDeps, 'isModuleExists');
      isModuleExistsStub.withArgs('RouterTest/Index').returns(true);
      const onSuccessHandler = stub();
      const onNotFoundHandler = stub();
      getPageSource(fakeRenderOptions, fakeRequest, onSuccessHandler, onNotFoundHandler)
         .then((pageSource) => {
            assert.isTrue(onSuccessHandler.called, 'Шаблон страницы должен был построиться');
            assert.isFalse(onNotFoundHandler.called);
            assert.hasAllKeys(pageSource, ['status', 'html']);
            // сбросим заглушку
            isModuleExistsStub.restore();
         })
         .then(done, done);
   });
});
