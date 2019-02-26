define('RouterTest/resources/fakeAppManager', ['require'], function(require) {
   return {
      createFakeApp: function(appName) {
         define(appName + '/Index', function() {
            return {};
         });
      }
   };
});
