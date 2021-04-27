import { assert } from 'chai';
import { createSandbox, SinonStub } from 'sinon';
import { Controller, Data, History, UrlRewriter } from 'Router/router';
import * as fakeAppManager from 'RouterTest/resources/fakeAppManager';

const stubSandbox = createSandbox();
const navigationDelay = 80;

interface IFakeControl {
   getInstanceId: () => string;
}

interface IFakeRoute {
   control: IFakeControl;
   beforeUrlChangeCb: SinonStub;
   afterUrlChangeCb: SinonStub;
}

function getFakeControl(id: string = ''): IFakeControl {
   const randomId = Math.random();
   return {
      getInstanceId: (): string => {
         return 'id-' + (id || randomId);
      }
   };
}

function getFakeForRegistration(): IFakeRoute {
   return {
      control: getFakeControl(),
      beforeUrlChangeCb: stubSandbox.stub(),
      afterUrlChangeCb: stubSandbox.stub()
   };
}

describe('Router/Controller', () => {
   before(() => {
      // define a fake ctestapp/Index component so tests
      // do not do redirects
      fakeAppManager.createFakeApp('ctestapp');
   });
   after(() => {
      stubSandbox.restore();
   });

   describe('#canChangeApplication', () => {
      let getCoreInstanceStub: SinonStub;

      beforeEach(() => {
         getCoreInstanceStub = stubSandbox.stub(Data, 'getCoreInstance');
      });
      afterEach(() => {
         getCoreInstanceStub.restore();
      });

      it('returns true if there is a Core instance in request', () => {
         getCoreInstanceStub.returns({
            changeApplicationHandler: () => {
               /* empty */
            }
         });
         assert.isTrue(Controller.canChangeApplication());
      });

      it('returns false if there is no Core instance in request', () => {
         getCoreInstanceStub.returns(undefined);
         assert.isFalse(Controller.canChangeApplication());
      });
   });

   describe('#addRoute/#removeRoute', () => {
      it('registers and unregisters the route', () => {
         const registeredRoutes = Data.getRegisteredRoutes();
         const fakeRoute = getFakeForRegistration();

         Controller.addRoute(fakeRoute.control, fakeRoute.beforeUrlChangeCb, fakeRoute.afterUrlChangeCb);
         assert.property(registeredRoutes, fakeRoute.control.getInstanceId());

         Controller.removeRoute(fakeRoute.control);
         assert.notProperty(registeredRoutes, fakeRoute.control.getInstanceId());
      });
   });
   describe('#addReference/#removeReference', () => {
      it('registers and unregisters the reference', () => {
         const registeredReferences = Data.getRegisteredReferences();
         const fakeReference = getFakeForRegistration();

         Controller.addReference(fakeReference.control, fakeReference.afterUrlChangeCb);
         assert.property(registeredReferences, fakeReference.control.getInstanceId());

         Controller.removeReference(fakeReference.control);
         assert.notProperty(registeredReferences, fakeReference.control.getInstanceId());
      });
   });

   describe('#navigate', () => {
      let fakeRoute: IFakeRoute;
      let fakeReference: IFakeRoute;
      let historyPushStub: SinonStub;

      before(() => {
         historyPushStub = stubSandbox.stub(History, 'push');
      });

      after(() => {
         historyPushStub.restore();
      });

      beforeEach(() => {
         fakeRoute = getFakeForRegistration();
         fakeReference = getFakeForRegistration();

         Controller.addRoute(fakeRoute.control, fakeRoute.beforeUrlChangeCb, fakeRoute.afterUrlChangeCb);
         Controller.addReference(fakeReference.control, fakeReference.afterUrlChangeCb);

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

      afterEach(() => {
         Controller.removeRoute(fakeRoute.control);
         Controller.removeReference(fakeReference.control);

         fakeRoute = null;
         fakeReference = null;

         historyPushStub.reset();
      });

      it('calls beforeChange callback for routes', (done) => {
         Controller.navigate({ state: '/ctestapp/other/url' }, () => {
            try {
               assert(
                  fakeRoute.beforeUrlChangeCb.called,
                  'expected beforeUrlChangeCb to be called for registered Route'
               );
               done();
            } catch (e) {
               done(e);
            }
         });
      });
      it('calls afterChange callback for routes', (done) => {
         Controller.navigate({ state: '/ctestapp/other/url' }, () => {
            setTimeout(() => {
               try {
                  assert(
                     fakeRoute.afterUrlChangeCb.called,
                     'expected afterUrlChangeCb to be called for registered Route'
                  );
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });
      });
      it('calls afterChange callback for references', (done) => {
         Controller.navigate({ state: '/ctestapp/other/url' }, () => {
            setTimeout(() => {
               try {
                  assert(
                     fakeReference.afterUrlChangeCb.called,
                     'expected afterUrlChangeCb to be called for registered Reference'
                  );
                  done();
               } catch (e) {
                  done(e);
               }
            }, navigationDelay);
         });
      });

      it('does not navigate if router rejects the update', (done) => {
         // fake beforeUrlChangeCb that returns Promise resolving to false
         fakeRoute.beforeUrlChangeCb.returns(Promise.resolve(false));

         Controller.navigate(
            { state: '/ctestapp/other/url' },
            () => {
               done(new Error('expected callback not to be called'));
            },
            () => {
               try {
                  assert(
                     fakeRoute.beforeUrlChangeCb.called,
                     'expected beforeUrlChangeCb to be called for registered Route'
                  );
                  assert(
                     fakeRoute.afterUrlChangeCb.notCalled,
                     'expected afterUrlChangeCb not to be called for registered route'
                  );
                  assert(
                     fakeReference.afterUrlChangeCb.notCalled,
                     'expected afterUrlChangeCb not to be called for registered Reference'
                  );
                  done();
               } catch (e) {
                  done(e);
               }
            }
         );
      });

      it('calls History.push with state and href', (done) => {
         const newState = '/ctestapp/other/url';
         Controller.navigate({ state: newState });
         setTimeout(() => {
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
      it('correctly passes href to History.push when specified', (done) => {
         const newState = '/ctestapp/new/state';
         const newHref = '/new';
         Controller.navigate({ state: newState, href: newHref });
         setTimeout(() => {
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

      it('rewrites the url when needed', (done) => {
         const newState = '/ctestapp/rewritten/state';
         const rewriteStub = stubSandbox.stub(UrlRewriter, 'get');
         const rewriteReverseStub = stubSandbox.stub(UrlRewriter, 'getReverse');

         // fake UrlRewriter.get returns the url it was passed, except
         // for /ctestapp/super/state, when it returns /ctestapp/rstate
         rewriteStub.returnsArg(0);
         rewriteStub.withArgs(newState).returns('/ctestapp/rstate');
         rewriteReverseStub.returnsArg(0);
         rewriteReverseStub.withArgs('/ctestapp/rstate').returns(newState);

         Controller.navigate({ state: newState });
         setTimeout(() => {
            try {
               assert(
                  historyPushStub.calledOnceWith({ state: '/ctestapp/rstate', href: newState }),
                  'expected History.push to be called with correct state and href'
               );
               done();
            } catch (e) {
               done(e);
            } finally {
               rewriteStub.restore();
               rewriteReverseStub.restore();
            }
         }, navigationDelay);
      });
   });

   describe('onpopstate handler', () => {
      let historyBackStub: SinonStub;
      let historyForwardStub: SinonStub;
      let fakeRoute: IFakeRoute;

      before(function (): void {
         if (typeof window === 'undefined') {
            this.skip();
         }
      });

      beforeEach(() => {
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

         fakeRoute = getFakeForRegistration();
         Controller.addRoute(fakeRoute.control, fakeRoute.beforeUrlChangeCb, fakeRoute.afterUrlChangeCb);
      });

      afterEach(() => {
         historyBackStub.restore();
         historyForwardStub.restore();
         Controller.removeRoute(fakeRoute.control);
      });

      it('can go back in history', (done) => {
         const fakeEvent = new PopStateEvent('popstate', { state: History.getPrevState() });
         window.onpopstate(fakeEvent);
         setTimeout(() => {
            try {
               assert(historyBackStub.called, 'expected History.back to be called');
               done();
            } catch (e) {
               done(e);
            }
         }, navigationDelay);
      });
      it('can go forward in history', (done) => {
         Data.setHistoryPosition(0);
         const fakeEvent = new PopStateEvent('popstate', { state: History.getNextState() });
         window.onpopstate(fakeEvent);
         setTimeout(() => {
            try {
               assert(historyForwardStub.called, 'expected History.forward to be called');
               done();
            } catch (e) {
               done(e);
            }
         }, navigationDelay);
      });
      it('обработка event.state не записанный роутером', (done) => {
         /** Это случай, когда на странице используется Router, но прикладник решил еще сам что-то добавлять
          * в window.history.state. Эти объекты Router не должен никак обрабатывать.
          */
         Data.setHistoryPosition(0);
         const fakeEvent = new PopStateEvent('popstate', { state: { field: 'data' } });
         const navigateStub = stubSandbox.stub(Controller, 'navigate');
         window.onpopstate(fakeEvent);
         setTimeout(() => {
            try {
               assert(!navigateStub.called, 'Ожидалось, что не позовется Controller.navigate');
               done();
            } catch (e) {
               done(e);
            }
         }, navigationDelay);
      });
   });
});
