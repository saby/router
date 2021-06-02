/* global assert */
/* global sinon */
define(['Router/ServerRouting', 'UICommon/Deps'], /**
 * @param { import('../Router/ServerRouting') } ServerRouting
 */
function(ServerRouting, UIDeps) {
   function createFakeRequest(path) {
      return {
         path: path,
         originalUrl: 'https://my-site.ru' + path
      };
   }

   describe('Router/ServerRouting', function() {
      before(function() {
         if (typeof window !== 'undefined') {
            this.skip();
         }
      });
      it('resolves application name by url correctly', function() {
         var fakeRequest = createFakeRequest('/register/?from=landing');
         assert.strictEqual(ServerRouting.getAppName(fakeRequest), 'register/Index');
      });

      it('rendering the provided application -> not existent module/template', function(done) {
         var fakeRequest = createFakeRequest('/register/?from=landing');
         var successHandlerCalled = false;
         var notFoundHandlerCalled = false;
         var onSuccessHandler = function(html) {
            successHandlerCalled = true;
         };
         var onNotFoundHandler = function(err) {
            notFoundHandlerCalled = true;
         };
         ServerRouting.getPageSource({}, fakeRequest, onSuccessHandler, onNotFoundHandler)
            .then(function(pageSource) {
               assert.isFalse(successHandlerCalled, 'Шаблон страницы не должен был построиться, ' +
                   'т.к. модуль register/Index не существует');
               assert.isTrue(notFoundHandlerCalled);
               assert.hasAllKeys(pageSource, ['status', 'error']);
            })
            .then(done, done);
      });

      it('rendering the provided application -> successfully generate page', function(done) {
         var fakeRequest = createFakeRequest('/RouterTest/?from=landing');
         // заглушка метода проверки существования модуля, который строим
         var isModuleExistsStub = sinon.stub(UIDeps, 'isModuleExists');
         isModuleExistsStub.withArgs('RouterTest/Index').returns(true);
         var successHandlerCalled = false;
         var notFoundHandlerCalled = false;
         var onSuccessHandler = function(html) {
            successHandlerCalled = true;
         };
         var onNotFoundHandler = function(err) {
            notFoundHandlerCalled = true;
         };
         ServerRouting.getPageSource({}, fakeRequest, onSuccessHandler, onNotFoundHandler)
            .then(function(pageSource) {
               assert.isTrue(successHandlerCalled, 'Шаблон страницы должен был построиться');
               assert.isFalse(notFoundHandlerCalled);
               assert.hasAllKeys(pageSource, ['status', 'html']);
               // сбросим заглушку
               isModuleExistsStub.restore();
            })
            .then(done, done);
      });
   });
});
