/* global assert */
/* eslint-disable max-nested-callbacks */
define(['Router/router'],

   /**
    * @param { import('../Router/router') } Router
    */
   function(Router) {
      var
         MaskResolver = Router.MaskResolver,
         Data = Router.Data;

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
               Data.setRelativeUrl('/page/data/main/order/test?first=number&second=string');
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
            describe('simple masks', function() {
               describe('starting at root url', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:value', { value: 'fvalue' });
                     assert.strictEqual(newUrl, '/first/fvalue');
                  });
               });
               describe('starting with simple params', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue/');
                  });
                  it('can change an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('second/:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/abc/');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newval/:value', { value: 'supernew' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newval/supernew');
                  });
                  it('can remove an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:value', { clear: true });
                     assert.strictEqual(newUrl, '/second/svalue/');
                  });
               });
               describe('starting with query', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newval/:value', { value: 'supernew' });
                     assert.strictEqual(newUrl, '/newval/supernew?qfrst=fvalue&qscnd=svalue');
                  });
               });
               describe('starting with simple params and query', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can change an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('second/:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/abc/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newval/:value', { value: 'supernew' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newval/supernew?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can remove an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:value', { clear: true });
                     assert.strictEqual(newUrl, '/second/svalue/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can replace value', function() {
                     var newUrl = MaskResolver.calculateHref('/test/:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/test/abc');
                  });
               });
            });

            describe('multiparam masks', function() {
               describe('starting at root url', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newname/:first/:second', { first: 'a', second: 'b' });
                     assert.strictEqual(newUrl, '/newname/a/b');
                  });
               });
               describe('starting with simple params', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue/');
                  });
                  it('can change an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:a/:b/:c', { a: 'ast', b: 'bst', c: 'cst' });
                     assert.strictEqual(newUrl, '/first/ast/bst/cst/');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newname/:first/:second', { first: 'a', second: 'b' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newname/a/b');
                  });
                  it('can remove an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:a/:b', { clear: true });
                     assert.strictEqual(newUrl, '/svalue/');
                  });
               });
               describe('starting with query', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newname/:first/:second', { first: 'a', second: 'b' });
                     assert.strictEqual(newUrl, '/newname/a/b?qfrst=fvalue&qscnd=svalue');
                  });
               });
               describe('starting with simple params and query', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can change an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:a/:b/:c', { a: 'ast', b: 'bst', c: 'cst' });
                     assert.strictEqual(newUrl, '/first/ast/bst/cst/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('newname/:first/:second', { first: 'a', second: 'b' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newname/a/b?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can remove an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:a/:b', { clear: true });
                     assert.strictEqual(newUrl, '/svalue/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can replace value', function() {
                     var newUrl = MaskResolver.calculateHref('/a/:bv/:cv', { bv: 'b', cv: 35 });
                     assert.strictEqual(newUrl, '/a/b/35');
                  });
               });
            });

            describe('query masks', function() {
               describe('starting at root url', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/?qfrst=abc');
                  });
               });
               describe('starting with simple params', function() {
                  it('can add a new value', function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue/');
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/?qfrst=abc');
                  });
                  it('can add a new value with forward slash', function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue');
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue?qfrst=abc');
                  });
               });
               describe('starting with query', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can change an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/?qfrst=abc&qscnd=svalue');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('qthrd=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/?qfrst=fvalue&qscnd=svalue&qthrd=abc');
                  });
                  it('can remove an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { clear: true });
                     assert.strictEqual(newUrl, '/?qscnd=svalue');
                  });
                  it('can remove the only value', function() {
                     Data.setRelativeUrl('/?qfrst=fvalue');
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { clear: true });
                     assert.strictEqual(newUrl, '/');
                  });
               });
               describe('starting with simple params and query', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue');
                  });
                  it('can change an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/?qfrst=abc&qscnd=svalue');
                  });
                  it('can add a new value', function() {
                     var newUrl = MaskResolver.calculateHref('qthrd=:value', { value: 'abc' });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue&qthrd=abc');
                  });
                  it('can remove an existing value', function() {
                     var newUrl = MaskResolver.calculateHref('qscnd=:value', { clear: true });
                     assert.strictEqual(newUrl, '/first/fvalue/second/svalue/?qfrst=fvalue');
                  });
               });
            });
         });
      });
   });
/* eslint-enable max-nested-callbacks */
