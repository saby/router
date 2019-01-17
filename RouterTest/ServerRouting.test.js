define([
   'RouterTest/resources/serverRoutingVerifier',
   'Router/ServerRouting'
], function(srVerifier, ServerRouting) {
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

      it('calls ServerRouting.setBaseTemplate to change application entry point', function() {
         ServerRouting.setBaseTemplate('wml!MyWml');
         var rendered = srVerifier.getRenderedTemplateAndApp('register/Index');

         assert.strictEqual(rendered.template, 'wml!MyWml');
         assert.strictEqual(rendered.app, 'register/Index');
      });

   });
});
