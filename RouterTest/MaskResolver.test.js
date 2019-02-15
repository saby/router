/* global assert */
/* eslint-disable max-nested-callbacks */
define(['Router/MaskResolver', 'Router/Data'], function(MaskResolver, RouterData) {
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
         it('decodes uri components', function() {
            var
               mask = 'fullname/:name',
               url = '/fullname/John%20Doe',
               calculated = MaskResolver.calculateUrlParams(mask, url);

            assert.strictEqual(calculated.name, 'John Doe');
         });

         it('decodes encoded forward slash', function() {
            var
               mask = 'order/:products',
               url = '/restaurant/order/bacon%2Flettuce%2Ftomato/time/now',
               calculated = MaskResolver.calculateUrlParams(mask, url);

            assert.strictEqual(calculated.products, 'bacon/lettuce/tomato');
         });

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

            // TODO Add root masks to docs
            it('recognizes root mask', function() {
               var
                  mask = '/tab/:tabName',
                  url = '/tab/main/subtab/tab/signup',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'main');
            });

            // TODO Add presence masks to docs?
            it('works with presence masks', function() {
               var
                  mask = 'word',
                  url = '/tab/main/order/word/2003';

               assert.doesNotThrow(MaskResolver.calculateUrlParams.bind(MaskResolver, mask, url));
            });
         });

         describe('one parameter with query', function() {
            it('interprets end of url as separator', function() {
               var
                  mask = 'param=:pvalue',
                  url = '/path?param=value',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('interprets ampersand as separator', function() {
               var
                  mask = 'param=:pvalue',
                  url = '/path?param=value&otherparam=othervalue',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('interprets ampersand as separator 2', function() {
               var
                  mask = 'param=:pvalue',
                  url = '/path?firstparam=firstvalue&param=value&otherparam=othervalue',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('interprets start of hash as separator', function() {
               var
                  mask = 'param=:pvalue',
                  url = '/path?param=value#hash=true',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });
         });

         describe('multiparameter mask', function() {
            it('reads the parameters in the correct order', function() {
               var
                  mask = 'page/:first/:second/:third',
                  url = '/mysite/page/the/main/menu/notthis',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.first, 'the');
               assert.strictEqual(calculated.second, 'main');
               assert.strictEqual(calculated.third, 'menu');
            });

            it('fills in the missing parameters as undefined', function() {
               var
                  mask = 'tab/:first/:second/:third',
                  url = '/order/tab/train',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.first, 'train');
               assert.strictEqual(calculated.second, undefined);
               assert.strictEqual(calculated.third, undefined);
            });

            it('recognizes root mask', function() {
               var
                  mask = '/page/:name/:tab',
                  url = '/page/main/order/page/275',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.name, 'main');
               assert.strictEqual(calculated.tab, 'order');
            });

            it('recognizes root mask and fills in the missing parameters as undefined', function() {
               var
                  mask = '/page/:name/:tab',
                  url = '/page/main',
                  calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.name, 'main');
               assert.strictEqual(calculated.tab, undefined);
            });
         });
      });

      // The majority of the code is shared with #calculateUrlParams, so there
      // are fewer tests for this one
      describe('#calculateCfgParams', function() {
         beforeEach(function() {
            RouterData.setRelativeUrl('/page/data/main/order/test?first=number&second=string');
         });

         it('returns value from cfg if mask is resolved', function() {
            var
               mask = 'data/:type',
               cfg = { type: 'override' },
               calculated = MaskResolver.calculateCfgParams(mask, cfg);

            assert.strictEqual(calculated.type, 'override');
         });

         it('returns undefined if cfg does not specify a value', function() {
            var
               mask = 'data/:type',
               cfg = { otherThing: 'ok' },
               calculated = MaskResolver.calculateCfgParams(mask, cfg);

            // mask has :type, but cfg does not
            assert.propertyVal(calculated, 'type', undefined);

            // mask does not have :otherThing
            assert.notProperty(calculated, 'otherThing');
         });

         it('returns value from cfg from query mask', function() {
            var
               mask = 'first=:value',
               cfg = { value: 27 },
               calculated = MaskResolver.calculateCfgParams(mask, cfg);

            assert.strictEqual(calculated.value, 27);
         });

         it('returns undefined if cfg does not specify a value from query mask', function() {
            var
               mask = 'first=:value',
               cfg = { otherThing: 27 },
               calculated = MaskResolver.calculateCfgParams(mask, cfg);

            assert.propertyVal(calculated, 'value', undefined);
            assert.notProperty(calculated, 'otherThing');
         });

         it('returns all fields for multiparameter masks', function() {
            var
               mask = 'data/:typeA/:typeB/:typeC',
               cfg = { typeB: 'bbb' },
               calculated = MaskResolver.calculateCfgParams(mask, cfg);

            assert.propertyVal(calculated, 'typeA', undefined);
            assert.propertyVal(calculated, 'typeB', 'bbb');
            assert.propertyVal(calculated, 'typeC', undefined);
         });
      });

      describe('#calculateHref', function() {
         // Everything for simple/query and mutltiparam
         // Check for urls with hashes
         // 1. Changing the existing value
         // 2. Adding a new value
         // 3. No changes
      });
   });
});
/* eslint-enable max-nested-callbacks */
