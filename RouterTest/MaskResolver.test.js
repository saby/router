/* eslint-disable max-nested-callbacks */
define(['Router/MaskResolver'], function(MaskResolver) {
   describe('Router/MaskResolver', function() {
      describe('#getAppNameByUrl', function() {
         it('returns index component name', function() {
            assert.strictEqual(MaskResolver.getAppNameByUrl('/Website/Register'), 'Website/Index');
         });

         it('ignores query params if they are separated by slash', function() {
            assert.strictEqual(MaskResolver.getAppNameByUrl('/MainPage/?waittime=100'), 'MainPage/Index');
         });

         it('ignores query params if they are NOT separated by slash', function() {
            assert.strictEqual(MaskResolver.getAppNameByUrl('/ServerStatus?timeout=500'), 'ServerStatus/Index');
         });

         it('ignores hash params if they are separated by slash', function() {
            assert.strictEqual(MaskResolver.getAppNameByUrl('/MainPage/#waittime=100'), 'MainPage/Index');
         });

         it('ignores hash params if they are NOT separated by slash', function() {
            assert.strictEqual(MaskResolver.getAppNameByUrl('/MainPage#waittime=100'), 'MainPage/Index');
         });

         it('allows one-part addresses', function() {
            assert.strictEqual(MaskResolver.getAppNameByUrl('Booking'), 'Booking/Index');
         });
      });

      describe('#calculateUrlParams', function() {
         describe('one parameter with slash', function() {
            it('interprets end of url as separator', function() {
               var mask = 'tab/:tabName',
                  url = '/order/tab/taxi',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'taxi');
            });

            it('interprets start of query as separator', function() {
               var mask = 'tab/:tabName',
                  url = '/order/tab/yacht?price=expensive',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'yacht');
            });

            it('interprets start of hash as separator', function() {
               var mask = 'tab/:tabName',
                  url = '/order/tab/plane#time_spent=10h',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'plane');
            });

            it('interprets slash as separator', function() {
               var mask = 'tab/:tabName',
                  url = '/order/tab/train/personal',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'train');
            });
         });
      });
   });
});
/* eslint-enable max-nested-callbacks */
