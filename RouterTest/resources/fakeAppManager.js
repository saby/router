define('RouterTest/resources/fakeAppManager', ['require'], function() {
   return {
      createFakeApp: function(appName) {
         define(appName + '/Index', function() {
            return {};
         });
      }
   };
});
