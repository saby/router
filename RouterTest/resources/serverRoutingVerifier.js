define('RouterTest/resources/serverRoutingVerifier', ['Router/ServerRouting'], function(ServerRouting) {
   function createFakeRequest(url) {
      if (typeof process === 'undefined') {
         window.process = {};
      }
      return { originalUrl: url };
   }

   return {
      getResolvedApp: function(url) {
         var fakeReq = createFakeRequest(url);
         return ServerRouting.getAppName(fakeReq);
      },
      getRenderedTemplateAndApp: function(appName) {
         var
            renderedTemplate, renderedApp,
            fakeRequest = createFakeRequest('/'),
            fakeResponse = {
               render: function(template, options) {
                  renderedTemplate = template;
                  renderedApp = options.application;
               }
            };

         ServerRouting.renderApp(fakeRequest, fakeResponse, appName);

         return {
            template: renderedTemplate,
            app: renderedApp
         };
      }
   };
});
