/* global assert, sinon */
define(['Router/router'], /**
 * @param { import('../Router/router') } Router
 */
function(Router) {
   var Popup = Router.Popup;

   describe('Router/Popup', function() {
      /** @type {Popup} */
      var pr;
      var returnHref;

      beforeEach(function() {
         var options = {
            routeName: 'test',
            popupDepth: 0
         };

         returnHref = Router.History.getCurrentState().href;
         pr = new Popup(options);
         pr._beforeMount(options);
         pr._getOpenerControl = function() {
            /*
               This method will be removed, it is not needed
               during testing.
            */
            return null;
         };
      });

      describe('url change events', function() {
         beforeEach(function() {
            sinon.stub(pr, '_notify');
         });

         afterEach(function() {
            pr._notify.restore();
         });

         it('fires urlAdded when parameter is added', function() {
            pr._urlChanged({}, { id: 'newId123' }, {});
            assert.isTrue(pr._notify.calledWith('urlAdded', ['newId123']));
         });
         it('fires urlRemoved when parameter is removed', function() {
            pr._urlChanged({}, {}, { id: 'oldId456' });
            assert.isTrue(pr._notify.calledWith('urlRemoved'));
         });
         it('fires urlChanged when parameter is changed', function() {
            pr._urlChanged({}, { id: 'newId' }, { id: 'oldId' });
            assert.isTrue(pr._notify.calledWith('urlChanged', ['newId', 'oldId']));
         });
      });

      describe('popup closed event', function() {
         beforeEach(function() {
            Router.Data.setRelativeUrl('/page/test-0/myEntityId');
            sinon.stub(Router.Controller, 'navigate');
         });

         afterEach(function() {
            Router.Controller.navigate.restore();
         });

         it('removes the popup parameter from url', function() {
            pr._popupClosed();

            var
               navigateArg = Router.Controller.navigate.getCall(0).args[0],
               navigateState = navigateArg.state;

            assert.include(navigateState, '/page');
            assert.notInclude(navigateState, 'test-0');
            assert.notInclude(navigateState, 'myEntityId');
         });
         it('returns to the href it was created with', function() {
            pr._popupClosed();

            var
               navigateArg = Router.Controller.navigate.getCall(0).args[0],
               navigateHref = navigateArg.href;

            assert.strictEqual(navigateHref, returnHref);
         });
      });

      describe('methods', function() {
         it('#_beforeUpdate', function() {
            assert.strictEqual(pr._urlMask, 'test-0/:id');
            pr._beforeUpdate({
               routeName: 'change',
               popupDepth: 7
            });
            assert.strictEqual(pr._urlMask, 'change-7/:id');
         });
         it('#_closePopup', function() {
            var fakeOpener = { close: sinon.spy() };
            pr._getOpenerControl = function() {
               return fakeOpener;
            };

            pr._closePopup();
            assert.isTrue(fakeOpener.close.called);
         });
         it('::getUrlMask', function() {
            var mask = Popup.getUrlMask({
               routeName: 'a',
               popupDepth: 5
            });
            assert.strictEqual(mask, 'a-5/:id');
         });
      });
   });
});
