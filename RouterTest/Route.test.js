/* global assert, sinon */
define(['Router/router', 'RouterTest/resources/controlManager'],

   /**
    * @param { import('../Router/router') } Router
    * @param { import('./resources/controlManager') } CM
    */
   function(Router, CM) {
      var
         Route = Router.Route,
         Data = Router.Data,
         defaultOptions = {
            mask: 'name/:value'
         };
      function createRoute(options) {
         return CM.createControl(Route, Object.assign({}, defaultOptions, options));
      }
      var destroyRoute = CM.destroyControl,
         waitForLifecycle = CM.waitForLifecycle;

      describe('Router/Route', function() {
         var createdRoute;

         before(function() {
            if (typeof window === 'undefined') {
               this.skip();
            }
         });

         afterEach(function() {
            if (createdRoute) {
               destroyRoute(createdRoute);
               createdRoute = null;
            }
         });

         it('registers when created', function(done) {
            var registeredRoutes = Data.getRegisteredRoutes();

            createdRoute = createRoute();
            waitForLifecycle()
               .then(function() {
                  assert.property(registeredRoutes, createdRoute.getInstanceId());
               })
               .then(done, done);
         });
         it('unregisters when destroyed', function(done) {
            var registeredRoutes = Data.getRegisteredRoutes(),
               instanceId;

            createdRoute = createRoute();
            waitForLifecycle()
               .then(function() {
                  instanceId = createdRoute.getInstanceId();
                  destroyRoute(createdRoute);
                  createdRoute = null;
                  return waitForLifecycle();
               })
               .then(function() {
                  assert.notProperty(registeredRoutes, instanceId);
               })
               .then(done, done);
         });

         it('fires on:enter when starts matching url', function(done) {
            var newLocation = { state: '/my/test/result' },
               oldLocation = { state: '/' },
               notifyStub;

            createdRoute = createRoute({ mask: 'test/:value' });
            waitForLifecycle()
               .then(function() {
                  notifyStub = sinon.stub(createdRoute, '_notify');
                  createdRoute._beforeApplyNewUrl(newLocation, oldLocation);
                  return waitForLifecycle();
               })
               .then(function() {
                  assert(notifyStub.calledOnce, 'expected _notify to be called');
                  var notifyArgs = notifyStub.getCall(0).args;
                  assert.strictEqual(notifyArgs[0], 'enter');
                  assert.strictEqual(notifyArgs[1][0], newLocation);
                  assert.strictEqual(notifyArgs[1][1], oldLocation);
               })
               .then(done, done);
         });
         it('fires on:enter if it is created when url matches the mask', function(done) {
            Data.setRelativeUrl('/unique/555-abc-def');
            createdRoute = createRoute({ mask: 'unique/:uid' });
            var notifyStub = sinon.stub(createdRoute, '_notify');

            waitForLifecycle()
               .then(function() {
                  assert(notifyStub.calledOnce, 'expected _notify to be called');
                  var notifyArgs = notifyStub.getCall(0).args;
                  assert.strictEqual(notifyArgs[0], 'enter');
               })
               .then(done, done);
         });
         it('fires on:leave when stops matching url', function(done) {
            var matchingLocation = { state: '/my/test/result' },
               nonMatchingLocation = { state: '/' },
               notifyStub;
            createdRoute = createRoute({ mask: 'test/:value' });
            waitForLifecycle()
               .then(function() {
               // change the location to a matching one
                  createdRoute._beforeApplyNewUrl(matchingLocation, nonMatchingLocation);
                  return waitForLifecycle();
               })
               .then(function() {
                  notifyStub = sinon.stub(createdRoute, '_notify');

                  // change the location to a non-matching one
                  createdRoute._beforeApplyNewUrl(nonMatchingLocation, matchingLocation);
                  return waitForLifecycle();
               })
               .then(function() {
                  assert(notifyStub.calledOnce, 'expected _notify to be called');
                  var notifyArgs = notifyStub.getCall(0).args;
                  assert.strictEqual(notifyArgs[0], 'leave');
                  assert.strictEqual(notifyArgs[1][0], nonMatchingLocation);
                  assert.strictEqual(notifyArgs[1][1], matchingLocation);
               })
               .then(done, done);
         });
         it('does not fire events when switching between two matched states', function(done) {
            var url1 = { state: '/my/test/one' },
               url2 = { state: '/my/test/two' },
               notifyStub;

            Data.setRelativeUrl(url1.state);

            createdRoute = createRoute({ mask: 'test/:value' });
            waitForLifecycle()
               .then(function() {
                  notifyStub = sinon.stub(createdRoute, '_notify');
                  createdRoute._beforeApplyNewUrl(url2, url1);
                  return waitForLifecycle();
               })
               .then(function() {
                  createdRoute._beforeApplyNewUrl(url1, url2);
                  return waitForLifecycle();
               })
               .then(function() {
                  assert(notifyStub.notCalled, 'expected _notify not to be called');
               })
               .then(done, done);
         });

         it('correctly resolves the url parameters', function(done) {
            var options = { mask: 'myparam=:value' };
            createdRoute = createRoute(options);
            waitForLifecycle()
               .then(function() {
                  Data.setRelativeUrl('/my/url?myparam=abc&test=true');
                  createdRoute._beforeUpdate(options);
                  return waitForLifecycle();
               })
               .then(function() {
                  assert.deepEqual(createdRoute._urlOptions, { value: 'abc' });
               })
               .then(done, done);
         });
      });
   });
