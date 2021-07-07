/* global assert, sinon */
define(['Router/router', 'Application/Initializer', 'SbisEnv/PresentationService'], /**
 * @param { import('../Router/router') } Router
 */
function (Router, AppInit, EnvNode) {
   var History = Router.History,
      Data = Router.Data;

   var env;
   if (typeof window === 'undefined') {
      env = EnvNode.default;
   }
   if(!AppInit.isInit()){
      AppInit.default({}, env);
   }

   function getFakeHistoryState(id, url) {
      return {
         id: id,
         state: url,
         href: url
      };
   }
   describe('Router/History', function() {
      var getVisibleUrlStub;

      beforeEach(function() {
         Data.setHistory([
            getFakeHistoryState(0, '/'),
            getFakeHistoryState(1, '/login'),
            getFakeHistoryState(2, '/login?oauth=saby')
         ]);
         Data.setHistoryPosition(1);
         Data.setRelativeUrl('/login');
         getVisibleUrlStub = sinon.stub(Data, 'getVisibleRelativeUrl');
         getVisibleUrlStub.returns('/signup');
      });

      afterEach(function() {
         Data.getVisibleRelativeUrl.restore();
      });

      it('returns the current history state', function() {
         var hstate = History.getCurrentState();
         assert.strictEqual(hstate.id, 1);
         assert.strictEqual(hstate.state, '/login');
         assert.strictEqual(hstate.href, '/login');
      });

      it('returns the previous history state', function() {
         var hstate = History.getPrevState();
         assert.strictEqual(hstate.id, 0);
         assert.strictEqual(hstate.state, '/');
         assert.strictEqual(hstate.href, '/');
      });

      it('returns the next history state', function() {
         var hstate = History.getNextState();
         assert.strictEqual(hstate.id, 2);
         assert.strictEqual(hstate.state, '/login?oauth=saby');
         assert.strictEqual(hstate.href, '/login?oauth=saby');
      });

      describe('#back', function() {
         it('goes to the previous state when possible', function() {
            History.back();
            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 0);
            assert.strictEqual(Data.getRelativeUrl(), hstate.state);
         });
         it('goes to the pre previous state when possible', function() {
            // переход на 2 позиции назад (в браузере зажать кнопку назад и выбрать состояние раньше предыдущего)
            const history = Data.getHistory();
            assert(history.length >= 3, 'expected history.length >= 3');
            Data.setHistoryPosition(2);
            Data.setRelativeUrl(history[2].state);

            // переход на 2 позиции назад
            History.back(history[0]);

            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 0);
            assert.strictEqual(Data.getRelativeUrl(), hstate.state);
         });
         it('creates a new starting state if called in first position', function() {
            Data.setHistoryPosition(0);
            var startingState = History.getCurrentState();
            assert.notExists(History.getPrevState());

            History.back();
            var
               hstate = History.getCurrentState(),
               expectedHref = Data.getVisibleRelativeUrl(),
               expectedState = (typeof window !== 'undefined' && window.history.state.state) || expectedHref;

            assert.strictEqual(hstate.id, -1);
            assert.strictEqual(hstate.state, expectedState);
            assert.strictEqual(hstate.href, expectedHref);

            assert.strictEqual(History.getNextState(), startingState);
         });
      });

      describe('#forward', function() {
         it('goes to the next state when possible', function() {
            History.forward();
            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 2);
            assert.strictEqual(Data.getRelativeUrl(), hstate.state);
         });
         it('goes to the next next state when possible', function() {
            // переход на 2 позиции вперед (в браузере зажать кнопку вперед и выбрать состояние далее следующего)
            const history = Data.getHistory();
            assert(history.length >= 3, 'expected history.length >= 3');
            Data.setHistoryPosition(0);
            Data.setRelativeUrl(history[0].state);

            // переход на 2 позиции вперед по истории
            History.forward(history[2]);

            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 2);
            assert.strictEqual(Data.getRelativeUrl(), hstate.state);
         });
         it('creates a new state if called in last position', function() {
            Data.setHistoryPosition(2);
            var startingState = History.getCurrentState();
            assert.notExists(History.getNextState());

            History.forward();
            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 3);

            assert.strictEqual(History.getPrevState(), startingState);
         });
      });

      describe('#push', function() {
         var pushStateStub;

         before(function() {
            if (typeof window === 'undefined') {
               this.skip();
            }
         });

         beforeEach(function() {
            pushStateStub = sinon.stub(window.history, 'pushState');
         });

         afterEach(function() {
            window.history.pushState.restore();
         });

         it('adds a new state if current position is the last one', function() {
            Data.setHistoryPosition(2);
            History.push({ state: '/upage?navigation=profile', href: '/profile' });

            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 3);
            assert.strictEqual(hstate.state, '/upage?navigation=profile');
            assert.strictEqual(hstate.href, '/profile');

            assert.strictEqual(Data.getRelativeUrl(), '/upage?navigation=profile');

            assert(pushStateStub.calledOnce, 'expected window.history.pushState to be called');
            var pushStateArgs = pushStateStub.getCall(0).args;
            assert.deepEqual(pushStateArgs[0], hstate);
            assert.strictEqual(pushStateArgs[2], '/profile');
         });

         it('replaces the states after the current one with the new state', function() {
            Data.setHistoryPosition(0);
            History.push({ state: '/upage?navigation=profile', href: '/profile' });

            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 1);
            assert.strictEqual(hstate.state, '/upage?navigation=profile');
            assert.strictEqual(hstate.href, '/profile');

            assert(pushStateStub.calledOnce);
            assert.notExists(History.getNextState());
         });
      });

      describe('#replaceState', function() {
         var replaceStateStub;

         before(function() {
            if (typeof window === 'undefined') {
               this.skip();
            }
         });

         beforeEach(function() {
            replaceStateStub = sinon.stub(window.history, 'replaceState');
         });

         afterEach(function() {
            window.history.replaceState.restore();
         });

         it('replaces the current state with the specified one', function() {
            Data.setHistoryPosition(2);
            History.replaceState({ state: '/upage?navigation=profile', href: '/profile' });

            var hstate = History.getCurrentState();
            assert.strictEqual(hstate.id, 2);
            assert.strictEqual(hstate.state, '/upage?navigation=profile');
            assert.strictEqual(hstate.href, '/profile');

            assert.strictEqual(Data.getRelativeUrl(), '/upage?navigation=profile');

            assert(replaceStateStub.calledOnce, 'expected window.history.replaceState to be called');
            var replaceStateArgs = replaceStateStub.getCall(0).args;
            assert.deepEqual(replaceStateArgs[0], hstate);
            assert.strictEqual(replaceStateArgs[2], '/profile');
         });
      });
   });
});
