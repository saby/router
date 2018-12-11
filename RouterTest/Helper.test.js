define(['Router/Helper'], function(RouterHelper) {
   var Helper = RouterHelper.default;

   describe('Router/Helper', function() {
      describe('#getAppNameByUrl', function() {
         it('returns index component name', function() {
            assert.strictEqual(Helper.getAppNameByUrl('/Website/Register'), 'Website/Index');
         });

         it('ignores query params if they are separated by slash', function() {
            assert.strictEqual(Helper.getAppNameByUrl('/MainPage/?waittime=100'), 'MainPage/Index');
         });

         it('ignores query params if they are NOT separated by slash', function() {
            assert.strictEqual(Helper.getAppNameByUrl('/ServerStatus?timeout=500'), 'ServerStatus/Index');
         });

         it('allows one-part addresses', function() {
            assert.strictEqual(Helper.getAppNameByUrl('Booking'), 'Booking/Index');
         });
      });
   });
});
