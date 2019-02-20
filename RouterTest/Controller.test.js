/* global assert, sinon */

define(['Router/Controller', 'Router/Data'],

   /**
   * @param { import('../Router/Controller') } Controller
   * @param { import('../Router/Data') } RouterData
   */
   function(Controller, RouterData) {
      function getFakeControl() {
         return {
            getInstanceId: function(id) {
               return 'id-' + (id || Math.random());
            }
         };
      }

      function getFakeForRegistration() {
         return {
            control: getFakeControl(),
            beforeApplyUrl: sinon.spy(),
            afterApplyUrl: sinon.spy()
         };
      }

      describe('Router/Controller', function() {
         var pushStateStub;

         before(function() {
            // replace pushState with a stub to prevent actual navigation
            pushStateStub = sinon.stub(window.history, 'pushState');
         });

         afterEach(function() {
            pushStateStub.reset();
         });

         after(function() {
            window.history.pushState.restore();
         });

         describe('#canChangeApplication', function() {
            var getCoreInstanceStub;

            beforeEach(function() {
               getCoreInstanceStub = sinon.stub(RouterData, 'getCoreInstance');
            });
            afterEach(function() {
               RouterData.getCoreInstance.restore();
            });

            it('returns true if there is a Core instance in request', function() {
               getCoreInstanceStub.returns({ changeApplicationHandler: function() { /* empty */ } });
               assert.isTrue(Controller.canChangeApplication());
            });

            it('returns false if there is no Core instance in request', function() {
               getCoreInstanceStub.returns(undefined);
               assert.isFalse(Controller.canChangeApplication());
            });
         });

         describe('#addRoute/#removeRoute', function() {
            it('registers and unregisters the route');
         });
         describe('#addReference/#removeReference', function() {
            it('registers and unregisters the reference');
         });

         describe('#navigate', function() {
            it('calls beforeChange callback for routes');
            it('calls afterChange callback for routes');
            it('calls afterChange callback for references');
         });
      });
   });
