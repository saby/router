/* global assert */
define(['Router/Reference', 'RouterTest/resources/controlManager', 'Router/Data'], function(Reference, CM, RouterData) {
   var defaultOptions = {
      state: 'name/:value',
      value: 'test',
      content: function() { /* empty template */ }
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
         var registeredReferences = RouterData.getRegisteredReferences();
         assert.isEmpty(registeredReferences);

         createdReference = createReference();
         waitForLifecycle().then(function() {
            assert.isNotEmpty(registeredReferences);
         }).then(done, done);
      });
      it('unregisters when destroyed', function(done) {
         var registeredReferences = RouterData.getRegisteredReferences();

         createdReference = createReference();
         waitForLifecycle().then(function() {
            destroyReference(createdReference);
            createdReference = null;
            return waitForLifecycle();
         }).then(function() {
            assert.isEmpty(registeredReferences);
         }).then(done, done);
      });

      it('correctly calculates the state', function(done) {
         RouterData.setRelativeUrl('/name/value');

         createdReference = createReference({ state: 'test/:tvalue', tvalue: 'true' });
         waitForLifecycle().then(function() {
            assert.strictEqual(createdReference._state, '/name/value/test/true');
         }).then(done, done);
      });
      it('updates the state when url changes', function(done) {
         var options = { state: 'test/:tvalue', tvalue: 'true' };
         RouterData.setRelativeUrl('/name/value');

         createdReference = createReference(options);
         waitForLifecycle().then(function() {
            RouterData.setRelativeUrl('/my/test/false/abc');
            createdReference._beforeUpdate(options);
         }).then(function() {
            assert.strictEqual(createdReference._state, '/my/test/true/abc');
         }).then(done, done);
      });

      it('correctly calculates the href', function(done) {
         RouterData.setRelativeUrl('/random/url/here?test=true');

         createdReference = createReference({ state: 'url/:location', href: '/:location', location: 'website' });
         waitForLifecycle().then(function() {
            assert.strictEqual(createdReference._href, '/website');
         }).then(done, done);
      });
      it('updates the href when option changes', function(done) {
         RouterData.setRelativeUrl('/random/url/here?test=true');

         createdReference = createReference({ state: 'url/:location', href: '/:location', location: 'website' });
         waitForLifecycle().then(function() {
            var newOptions = Object.assign({}, createdReference._options, { location: 'book' });
            createdReference._beforeMount(newOptions);
            createdReference._options = newOptions;
            return waitForLifecycle();
         }).then(function() {
            assert.strictEqual(createdReference._href, '/book');
         }).then(done, done);
      });
   });
});
