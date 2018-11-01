define([
   'RouterTest/resources/serverRoutingVerifier'
], function(srVerifier) {
   describe('Router/ServerRouting', function() {

      it('correctly resolves application name by simple url', function() {
         var resolvedApp = srVerifier.getResolvedApp('/register/?from=landing');

         assert.strictEqual(resolvedApp, 'register/Index');
      });

      it('calls response.render to render the application provided', function() {
         var rendered = srVerifier.getRenderedTemplateAndApp('register/Index');

         assert.strictEqual(rendered.template, 'wml!Controls/Application/Route');
         assert.strictEqual(rendered.app, 'register/Index');
      });

   });
});
