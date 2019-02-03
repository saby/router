define('RouterTest/resources/serverRoutingVerifier', ['Router/ServerRouting'], function(ServerRouting) {
   function createFakeRequest(path) {
      var createdProcess = false;
      if (typeof process === 'undefined') {
         window.process = {};
         createdProcess = true;
      }
      return {
         path: path,
         originalUrl: 'https://my-site.ru' + path,
         destroy: function() {
            if (createdProcess) {
               delete window.process;
            }
         }
      };
   }

   return {
      getResolvedApp: function(url) {
         var
            fakeReq = createFakeRequest(url),
            result = ServerRouting.getAppName(fakeReq);

         fakeReq.destroy();
         return result;
      },
      getRenderedTemplateAndApp: function(appName) {
         var
            renderedTemplate,
            renderedApp,
            fakeRequest = createFakeRequest('/'),
            fakeResponse = {
               render: function(template, options) {
                  renderedTemplate = template;
                  renderedApp = options.application;
               }
            };

         ServerRouting.renderApp(fakeRequest, fakeResponse, appName);
         fakeRequest.destroy();

         return {
            template: renderedTemplate,
            app: renderedApp
         };
      }
   };
});
