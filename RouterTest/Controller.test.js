/* global assert, sinon */
define(['Router/router', 'RouterTest/resources/fakeAppManager', 'Application/Initializer', 'SbisEnv/PresentationService'], /**
 * @param { import('../Router/router') } Router
 * @param { import('./resources/fakeAppManager') } fakeAppManager
 */
function (Router, fakeAppManager, AppInit, EnvNode) {
   // Controller, Data, History, UrlRewriter
   var Controller = Router.Controller,
      Data = Router.Data,
      History = Router.History,
      UrlRewriter = Router.UrlRewriter,
      stubSandbox = sinon.createSandbox(),
      navigationDelay = 80;

   var env;
   if (typeof window === 'undefined') {
      env = EnvNode.default;
   }
   AppInit.default({}, env);

   function getFakeControl(id) {
      var randomId = Math.random();
      return {
         getInstanceId: function() {
            return 'id-' + (id || randomId);
         }
      };
   }

   function getFakeForRegistration() {
      return {
         control: getFakeControl(),
         beforeApplyUrl: stubSandbox.stub(),
         afterApplyUrl: stubSandbox.stub()
      };
   }

   describe('Router/Controller', function() {
      before(function() {
         // define a fake ctestapp/Index component so tests
         // do not do redirects
         fakeAppManager.createFakeApp('ctestapp');
      });
      after(function() {
         stubSandbox.restore();
      });

      describe('#canChangeApplication', function() {
         var getCoreInstanceStub;

         beforeEach(function() {
            getCoreInstanceStub = stubSandbox.stub(Data, 'getCoreInstance');
         });
         afterEach(function() {
            Data.getCoreInstance.restore();
         });

         it('returns true if there is a Core instance in request', function() {
            getCoreInstanceStub.returns({
               changeApplicationHandler: function() {
                  /* empty */
               }
            });
            assert.isTrue(Controller.canChangeApplication());
         });

         it('returns false if there is no Core instance in request', function() {
            getCoreInstanceStub.returns(undefined);
            assert.isFalse(Controller.canChangeApplication());
         });
      });

      describe('#addRoute/#removeRoute', function() {
         it('registers and unregisters the route', function() {
            var registeredRoutes = Data.getRegisteredRoutes(),
               fakeRoute = getFakeForRegistration();

            Controller.addRoute(fakeRoute.control, fakeRoute.beforeApplyUrl, fakeRoute.afterApplyUrl);
            assert.property(registeredRoutes, fakeRoute.control.getInstanceId());

            Controller.removeRoute(fakeRoute.control);
            assert.notProperty(registeredRoutes, fakeRoute.control);
         });
      });
      describe('#addReference/#removeReference', function() {
         it('registers and unregisters the reference', function() {
            var registeredReferences = Data.getRegisteredReferences(),
               fakeReference = getFakeForRegistration();

            Controller.addReference(fakeReference.control, fakeReference.afterApplyUrl);
            assert.property(registeredReferences, fakeReference.control.getInstanceId());

            Controller.removeRoute(fakeReference.control);
            assert.notProperty(registeredReferences, fakeReference.control);
         });
      });

      describe('#navigate', function() {
         var fakeRoute, fakeReference, historyPushStub;

         before(function() {
            historyPushStub = stubSandbox.stub(History, 'push');
         });

         after(function() {
            History.push.restore();
         });

         beforeEach(function() {
            fakeRoute = getFakeForRegistration();
            fakeReference = getFakeForRegistration();

            Controller.addRoute(fakeRoute.control, fakeRoute.beforeApplyUrl, fakeRoute.afterApplyUrl);
            Controller.addReference(fakeReference.control, fakeReference.afterApplyUrl);

            // fake the page we are on for navigation not to trigger
            Data.setRelativeUrl('/ctestapp/random/url');
            Data.setHistory([
               {
                  id: 0,
                  state: '/ctestapp/random/url',
                  href: '/ctestapp/random/url'
               }
            ]);
            Data.setHistoryPosition(0);
         });

         afterEach(function() {
            Controller.removeRoute(fakeRoute.control);
            Controller.removeReference(fakeReference.control);

            fakeRoute = null;
            fakeReference = null;

            historyPushStub.reset();
         });

         it('calls beforeChange callback for routes', function(done) {
            Controller.navigate({ state: '/ctestapp/other/url' }, function() {
               try {
                  assert(
                     fakeRoute.beforeApplyUrl.called,
                     'expected beforeUrlChangeCb to be called for registered Route'
                  );
                  done();
               } catch (e) {
                  done(e);
               }
            });
         });
         it('calls afterChange callback for routes', function(done) {
            Controller.navigate({ state: '/ctestapp/other/url' }, function() {
               setTimeout(function() {
                  try {
                     assert(
                        fakeRoute.afterApplyUrl.called,
                        'expected afterUrlChangeCb to be called for registered Route'
                     );
                     done();
                  } catch (e) {
                     done(e);
                  }
               }, navigationDelay);
            });
         });
         it('calls afterChange callback for references', function(done) {
            Controller.navigate({ state: '/ctestapp/other/url' }, function() {
               setTimeout(function() {
                  try {
                     assert(
                        fakeReference.afterApplyUrl.called,
                        'expected afterUrlChangeCb to be called for registered Reference'
                     );
                     done();
                  } catch (e) {
                     done(e);
                  }
               }, navigationDelay);
            });
         });

         it('does not navigate if router rejects the update', function(done) {
            // fake beforeApplyUrl that returns Promise resolving to false
            fakeRoute.beforeApplyUrl.returns(Promise.resolve(false));

            Controller.navigate(
               { state: '/ctestapp/other/url' },
               function() {
                  done(new Error('expected callback not to be called'));
               },
               function() {
                  try {
                     assert(
                        fakeRoute.beforeApplyUrl.called,
                        'expected beforeUrlChangeCb to be called for registered Route'
                     );
                     assert(
                        fakeRoute.afterApplyUrl.notCalled,
                        'expected afterUrlChangeCb not to be called for registered route'
                     );
                     assert(
                        fakeReference.afterApplyUrl.notCalled,
                        'expected afterUrlChangeCb not to be called for registered Reference'
                     );
                     done();
                  } catch (e) {
                     done(e);
                  }
               }
            );
         });

         it('calls History.push with state and href', function(done) {
            var newState = '/ctestapp/other/url';
            Controller.navigate({ state: newState });
            setTimeout(function() {
               try {
                  assert(
                     historyPushStub.calledOnceWith({ state: newState, href: newState }),
                     'expected History.push to be called with correct state and href'
                  );
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });
         it('correctly passes href to History.push when specified', function(done) {
            var newState = '/ctestapp/new/state',
               newHref = '/new';
            Controller.navigate({ state: newState, href: newHref });
            setTimeout(function() {
               try {
                  assert(
                     historyPushStub.calledOnceWith({ state: newState, href: newHref }),
                     'expected History.push to be called with correct state and href'
                  );
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });

         it('rewrites the url when needed', function(done) {
            var newState = '/ctestapp/rewritten/state',
               rewriteStub = stubSandbox.stub(UrlRewriter, 'get'),
               rewriteReverseStub = stubSandbox.stub(UrlRewriter, 'getReverse');

            // fake UrlRewriter.get returns the url it was passed, except
            // for /ctestapp/super/state, when it returns /ctestapp/rstate
            rewriteStub.returnsArg(0);
            rewriteStub.withArgs(newState).returns('/ctestapp/rstate');
            rewriteReverseStub.returnsArg(0);
            rewriteReverseStub.withArgs('/ctestapp/rstate').returns(newState);

            Controller.navigate({ state: newState });
            setTimeout(function() {
               try {
                  assert(
                     historyPushStub.calledOnceWith({ state: '/ctestapp/rstate', href: newState }),
                     'expected History.push to be called with correct state and href'
                  );
                  done();
               } catch (e) {
                  done(e);
               } finally {
                  UrlRewriter.get.restore();
                  UrlRewriter.getReverse.restore();
               }
            }, navigationDelay);
         });

         it('loads new application and calls changeApplicationHandler', function(done) {
            fakeAppManager.createFakeApp('anotherapp');

            var fakeCoreInstance = {
                  changeApplicationHandler: stubSandbox.spy()
               },
               getCoreInstanceStub = stubSandbox.stub(Data, 'getCoreInstance');

            getCoreInstanceStub.returns(fakeCoreInstance);

            Controller.navigate({ state: '/anotherapp/test/url' });
            setTimeout(function() {
               try {
                  assert(
                     fakeCoreInstance.changeApplicationHandler.calledOnceWith(null, 'anotherapp/Index'),
                     'expected changeApplicationHandler to be called'
                  );
                  done();
               } catch (e) {
                  done(e);
               } finally {
                  Data.getCoreInstance.restore();
               }
            }, navigationDelay * 2);
         });
      });

      describe('onpopstate handler', function() {
         var historyBackStub, historyForwardStub;

         before(function() {
            if (typeof window === 'undefined') {
               this.skip();
            }
         });

         beforeEach(function() {
            Data.setHistory([
               {
                  id: 0,
                  state: '/ctestapp/page/first',
                  href: '/ctestapp/page/first'
               },
               {
                  id: 1,
                  state: '/ctestapp/page/second',
                  href: '/ctestapp/page/second'
               }
            ]);
            Data.setHistoryPosition(1);
            Data.setRelativeUrl('/ctestapp/page/second');
            historyBackStub = stubSandbox.stub(History, 'back');
            historyForwardStub = stubSandbox.stub(History, 'forward');
         });

         afterEach(function() {
            historyBackStub.restore();
            historyForwardStub.restore();
         });

         it('can go back in history', function(done) {
            var fakeEvent = new PopStateEvent('popstate', { state: History.getPrevState() });
            window.onpopstate(fakeEvent);
            setTimeout(function() {
               try {
                  assert(historyBackStub.called, 'expected History.back to be called');
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });
         it('can go forward in history', function(done) {
            Data.setHistoryPosition(0);
            var fakeEvent = new PopStateEvent('popstate', { state: History.getNextState() });
            window.onpopstate(fakeEvent);
            setTimeout(function() {
               try {
                  assert(historyForwardStub.called, 'expected History.forward to be called');
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });

         it('can successfully create new state going back', function(done) {
            Data.setHistoryPosition(0);
            var fakeEvent = new PopStateEvent('popstate', { state: null }),
               getVisibleUrlStub = stubSandbox.stub(Data, 'getVisibleRelativeUrl');

            getVisibleUrlStub.returns('/ctestapp/gobackpage');
            historyBackStub.restore();
            window.onpopstate(fakeEvent);
            setTimeout(function() {
               try {
                  var createdState = History.getCurrentState();
                  assert.strictEqual(createdState.state, '/ctestapp/gobackpage');
                  assert.strictEqual(createdState.id, History.getNextState().id - 1);
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });
         it('can successfully create new state going forward', function(done) {
            Data.setHistoryPosition(1);
            var fakeEvent = new PopStateEvent('popstate', {
               state: { id: 3, state: '/ctestapp/goforwardpage', href: '/ctestapp/goforwardpage' }
            });

            historyForwardStub.restore();
            Data.setRelativeUrl('/ctestapp/goforwardpage');
            window.onpopstate(fakeEvent);
            setTimeout(function() {
               try {
                  var createdState = History.getCurrentState();
                  assert.strictEqual(createdState.state, '/ctestapp/goforwardpage');
                  assert.strictEqual(createdState.id, History.getPrevState().id + 1);
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });
      });
   });
});
