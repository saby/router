/* global assert, sinon */
define(['Router/router', 'RouterTest/resources/controlManager'], /**
 * @param { import('../Router/router') } Router
 * @param { import('./resources/controlManager') } CM
 */
function(Router, CM) {
   var Reference = Router.Reference,
      Data = Router.Data,
      Controller = Router.Controller,
      defaultOptions = {
         state: 'name/:value',
         value: 'test',
         content: function() {
            /* empty template */
         }
      };
   function createReference(options) {
      return CM.createControl(Reference, Object.assign({}, defaultOptions, options));
   }
   var destroyReference = CM.destroyControl,
      waitForLifecycle = CM.waitForLifecycle;

   describe('Router/Reference', function() {
      var createdReference;

      before(function() {
         if (typeof window === 'undefined') {
            this.skip();
         }
      });

      afterEach(function() {
         if (createdReference) {
            destroyReference(createdReference);
            createdReference = null;
         }
      });

      it('registers when created', function(done) {
         var registeredReferences = Data.getRegisteredReferences();

         createdReference = createReference();
         waitForLifecycle()
            .then(function() {
               assert.property(registeredReferences, createdReference.getInstanceId());
            })
            .then(done, done);
      });
      it('unregisters when destroyed', function(done) {
         var registeredReferences = Data.getRegisteredReferences(),
            instanceId;

         createdReference = createReference();
         waitForLifecycle()
            .then(function() {
               instanceId = createdReference.getInstanceId();
               destroyReference(createdReference);
               createdReference = null;
               return waitForLifecycle();
            })
            .then(function() {
               assert.notProperty(registeredReferences, instanceId);
            })
            .then(done, done);
      });

      it('correctly calculates the state', function(done) {
         Data.setRelativeUrl('/name/value');

         createdReference = createReference({ state: 'test/:tvalue', tvalue: 'true' });
         waitForLifecycle()
            .then(function() {
               assert.strictEqual(createdReference._state, '/name/value/test/true');
            })
            .then(done, done);
      });
      it('updates the state when url changes', function(done) {
         var options = { state: 'test/:tvalue', tvalue: 'true' };
         Data.setRelativeUrl('/name/value');

         createdReference = createReference(options);
         waitForLifecycle()
            .then(function() {
               Data.setRelativeUrl('/my/test/false/abc');
               createdReference._beforeUpdate(options);
            })
            .then(function() {
               assert.strictEqual(createdReference._state, '/my/test/true/abc');
            })
            .then(done, done);
      });

      it('correctly calculates the href', function(done) {
         Data.setRelativeUrl('/random/url/here?test=true');

         createdReference = createReference({ state: 'url/:location', href: '/:location', location: 'website' });
         waitForLifecycle()
            .then(function() {
               assert.strictEqual(createdReference._href, '/website');
            })
            .then(done, done);
      });
      it('updates the href when option changes', function(done) {
         Data.setRelativeUrl('/random/url/here?test=true');

         createdReference = createReference({ state: 'url/:location', href: '/:location', location: 'website' });
         waitForLifecycle()
            .then(function() {
               var newOptions = Object.assign({}, createdReference._options, { location: 'book' });
               createdReference._beforeUpdate(newOptions);
               assert.strictEqual(createdReference._href, '/book');
            })
            .then(done, done);
      }).timeout(1000000000);

      it('prevents default and navigates when clicked', function(done) {
         var eventObject = { preventDefault: sinon.spy(), nativeEvent: { button: 0 } },
            navigateStub = sinon.stub(Controller, 'navigate');

         createdReference = createReference();
         waitForLifecycle()
            .then(function() {
               createdReference._clickHandler(eventObject);
               return waitForLifecycle(50);
            })
            .then(function() {
               assert(eventObject.preventDefault.calledOnce, 'expected preventDefault to be called for click event');
               assert(navigateStub.calledOnce, 'expected Controller.navigate to be called on click');
            })
            .then(done, done);
      });
   });
});
