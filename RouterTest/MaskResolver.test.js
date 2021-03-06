/* global assert */
/* eslint-disable max-nested-callbacks */
define(['Router/router'], /**
 * @param { import('../Router/router') } Router
 */
function (Router) {
   var MaskResolver = Router.MaskResolver,
      Data = Router.Data;

   // переопределим router.js в тестах, т.к. он подтянется из корня, а там из RouterDemo
   Router.UrlRewriter._prepareRoutes({});

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
            var mask = 'fullname/:name',
                url = '/fullname/John%20Doe',
                calculated = MaskResolver.calculateUrlParams(mask, url);

            assert.strictEqual(calculated.name, 'John Doe');
         });

         it('decodes encoded forward slash', function() {
            var mask = 'order/:products',
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
               var mask = '/tab/:tabName',
                   url = '/tab/main/subtab/tab/signup',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'main');
            });

            // TODO Add presence masks to docs?
            it('works with presence masks', function() {
               var mask = 'word',
                   url = '/tab/main/order/word/2003';

               assert.doesNotThrow(MaskResolver.calculateUrlParams.bind(MaskResolver, mask, url));
            });

            it('few parameters in mask', function() {
               var mask = 'tab/:tabName/subtab/:subName',
                   url = '/order/tab/taxi/subtab/cars',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'taxi');
               assert.strictEqual(calculated.subName, 'cars');
            });

            it('few parameters in mask not in url', function() {
               var mask = 'tab/:tabName/subtab/:subName',
                   url = '/order/tab/taxi',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.tabName, 'taxi');
               assert.strictEqual(calculated.subName, undefined);
            });
         });

         describe('one parameter with query', function() {
            it('interprets end of url as separator', function() {
               var mask = 'param=:pvalue',
                   url = '/path?param=value',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('interprets ampersand as separator', function() {
               var mask = 'param=:pvalue',
                   url = '/path?param=value&otherparam=othervalue',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('interprets ampersand as separator 2', function() {
               var mask = 'param=:pvalue',
                   url = '/path?firstparam=firstvalue&param=value&otherparam=othervalue',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('interprets start of hash as separator', function() {
               var mask = 'param=:pvalue',
                   url = '/path?param=value#hash=true',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
            });

            it('few parameters in mask', function() {
               var mask = 'param=:pvalue&query=:qvalue',
                   url = '/path?param=value&query=different',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
               assert.strictEqual(calculated.qvalue, 'different');
            });

            it('few parameters in mask not in url', function() {
               var mask = 'param=:pvalue&query=:qvalue',
                   url = '/path?param=value',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.pvalue, 'value');
               assert.strictEqual(calculated.qvalue, undefined);
            });
         });

         describe('multiparameter mask', function() {
            it('reads the parameters in the correct order', function() {
               var mask = 'page/:first/:second/:third',
                   url = '/mysite/page/the/main/menu/notthis',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.first, 'the');
               assert.strictEqual(calculated.second, 'main');
               assert.strictEqual(calculated.third, 'menu');
            });

            it('fills in the missing parameters as undefined', function() {
               var mask = 'tab/:first/:second/:third',
                   url = '/order/tab/train',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.first, 'train');
               assert.strictEqual(calculated.second, undefined);
               assert.strictEqual(calculated.third, undefined);
            });

            it('recognizes root mask', function() {
               var mask = '/page/:name/:tab',
                   url = '/page/main/order/page/275',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.name, 'main');
               assert.strictEqual(calculated.tab, 'order');
            });

            it('recognizes root mask and fills in the missing parameters as undefined', function() {
               var mask = '/page/:name/:tab',
                   url = '/page/main',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.name, 'main');
               assert.strictEqual(calculated.tab, undefined);
            });

            it('mask with slash at the end', function() {
               var mask = 'tab/:page/:key/',
                   url = '/path/tab/complect/20384325',
                   calculated = MaskResolver.calculateUrlParams(mask, url);

               assert.strictEqual(calculated.page, 'complect');
               assert.strictEqual(calculated.key, '20384325');
            });
         });
      });

      describe('#calculateHref', function() {
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
                  assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newval/supernew/');
               });
               it('can add a new value and change an existing value', function() {
                  var newUrl = MaskResolver.calculateHref('first/:fvalue/newval/:value',
                                                          {fvalue: 'fnew', value: 'supernew'});
                  assert.strictEqual(newUrl, '/first/fnew/second/svalue/newval/supernew/');
                  // то же самое, но в маске порядок полей не как в url
                  newUrl = MaskResolver.calculateHref('newval/:value/second/:svalue',
                      {value: 'supernew', svalue: 'snew'});
                  assert.strictEqual(newUrl, '/first/fvalue/second/snew/newval/supernew/');
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
                  assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newval/supernew/?qfrst=fvalue&qscnd=svalue');
               });
               it('can remove an existing value', function() {
                  var newUrl = MaskResolver.calculateHref('first/:value', { clear: true });
                  assert.strictEqual(newUrl, '/second/svalue/?qfrst=fvalue&qscnd=svalue');
               });
               it('can replace value', function() {
                  var newUrl = MaskResolver.calculateHref('/test/:value', { value: 'abc' });
                  assert.strictEqual(newUrl, '/test/abc/');
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
                  assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newname/a/b/');
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
                  assert.strictEqual(newUrl, '/first/fvalue/second/svalue/newname/a/b/?qfrst=fvalue&qscnd=svalue');
               });
               it('can remove an existing value', function() {
                  var newUrl = MaskResolver.calculateHref('first/:a/:b', { clear: true });
                  assert.strictEqual(newUrl, '/svalue/?qfrst=fvalue&qscnd=svalue');
               });
               it('can replace value', function() {
                  var newUrl = MaskResolver.calculateHref('/newpath/:bv/:cv', { bv: 'b', cv: 35 });
                  assert.strictEqual(newUrl, '/newpath/b/35/');
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

                  // НОВЫЙ ТЕСТ!!!!!!
                  it('can change an existing value and add new param', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:vfrst&qthrd=:vthrd', { vfrst: '', vthrd: 'three' });
                     assert.strictEqual(newUrl, '/?qfrst=&qscnd=svalue&qthrd=three');
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

            describe('shared cases', function() {
               describe('simple param', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/first/special%20param/second/svalue');
                  });

                  it('can add encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('test/:value', { value: 'has spaces' });
                     assert.strictEqual(newUrl, '/first/special%20param/second/svalue/test/has%20spaces');
                  });
                  it('can change encoded value to encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:value', { value: 'has spaces' });
                     assert.strictEqual(newUrl, '/first/has%20spaces/second/svalue');
                  });
                  it('can change encoded value to unencoded value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:value', { value: 'simple' });
                     assert.strictEqual(newUrl, '/first/simple/second/svalue');
                  });
                  it('can change unencoded value to encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('second/:value', { value: 'with/slash' });
                     assert.strictEqual(newUrl, '/first/special%20param/second/with%2Fslash');
                  });
                  it('can remove encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('first/:value', { clear: true });
                     assert.strictEqual(newUrl, '/second/svalue');
                  });
               });

               describe('query param', function() {
                  beforeEach(function() {
                     Data.setRelativeUrl('/?qfrst=special%20value&qscnd=svalue');
                  });

                  it('can add encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('qthrd=:value', { value: 'mail@me' });
                     assert.strictEqual(newUrl, '/?qfrst=special%20value&qscnd=svalue&qthrd=mail%40me');
                  });
                  it('can change encoded value to encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'with spaces'});
                     assert.strictEqual(newUrl, '/?qfrst=with%20spaces&qscnd=svalue');
                  });
                  it('can change encoded value to unencoded value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { value: 'simple'});
                     assert.strictEqual(newUrl, '/?qfrst=simple&qscnd=svalue');
                  });
                  it('can change unencoded value to encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('qscnd=:value', { value: 'my$money' });
                     assert.strictEqual(newUrl, '/?qfrst=special%20value&qscnd=my%24money');
                  });
                  it('can remove encoded value', function() {
                     var newUrl = MaskResolver.calculateHref('qfrst=:value', { clear: true });
                     assert.strictEqual(newUrl, '/?qscnd=svalue');
                  });
               });
            });
         });

         describe('appends to the end of url if mask has more parameters than url', function() {
            it('can append to end of url', function() {
               Data.setRelativeUrl('/root/page/signup');
               var newUrl = MaskResolver.calculateHref(
                  'page/:pageName/:pageParam',
                  { pageName: 'login', pageParam: 'now' }
               );
               assert.strictEqual(newUrl, '/root/page/login/now');
            });
            it('can append to end of main part of url if it has query params', function() {
               Data.setRelativeUrl('/root/page/signup?query=true');
               var newUrl = MaskResolver.calculateHref(
                  'page/:pageName/:pageParam',
                  { pageName: 'login', pageParam: 'now' }
               );
               assert.strictEqual(newUrl, '/root/page/login/now?query=true');
            });
            it('can append to end of main part of url if it has query params after slash', function() {
               Data.setRelativeUrl('/root/page/signup/?query=true');
               var newUrl = MaskResolver.calculateHref(
                  'page/:pageName/:pageParam',
                  { pageName: 'login', pageParam: 'now' }
               );
               // trailing slash doesn't matter for routing
               assert.strictEqual(newUrl, '/root/page/login/now/?query=true');
            });
            it('can append to end of main part of url if it has hash', function() {
               Data.setRelativeUrl('/root/page/signup#hashparam');
               var newUrl = MaskResolver.calculateHref(
                  'page/:pageName/:pageParam',
                  { pageName: 'login', pageParam: 'now' }
               );
               assert.strictEqual(newUrl, '/root/page/login/now#hashparam');
            });
            it('can append to end of main part of url if it has hash after slash', function() {
               Data.setRelativeUrl('/root/page/signup/#hashparam');
               var newUrl = MaskResolver.calculateHref(
                  'page/:pageName/:pageParam',
                  { pageName: 'login', pageParam: 'now' }
               );
               assert.strictEqual(newUrl, '/root/page/login/now/#hashparam');
            });
         });

         describe('fragments with slash', function() {
            beforeEach(function() {
               Data.setRelativeUrl('/path/#first/fvalue/second/svalue');
            });
            it('can change an existing value', function() {
               var newUrl = MaskResolver.calculateHref('first/:value', { value: 'abc' });
               assert.strictEqual(newUrl, '/path/#first/abc/second/svalue');
               newUrl = MaskResolver.calculateHref('second/:value', { value: 'abc' });
               assert.strictEqual(newUrl, '/path/#first/fvalue/second/abc');
            });
            it('can add a new value', function() {
               var newUrl = MaskResolver.calculateHref('#newval/:value', { value: 'supernew' });
               assert.strictEqual(newUrl, '/path/#first/fvalue/second/svalue/newval/supernew');
            });
            // it('can add a new value and change an existing value', function() {
            //    var newUrl = MaskResolver.calculateHref('first/:fvalue/newval/:value',
            //        {fvalue: 'fnew', value: 'supernew'});
            //    assert.strictEqual(newUrl, '/first/fnew/second/svalue/newval/supernew/');
            //    // то же самое, но в маске порядок полей не как в url
            //    newUrl = MaskResolver.calculateHref('newval/:value/second/:svalue',
            //        {value: 'supernew', svalue: 'snew'});
            //    assert.strictEqual(newUrl, '/first/fvalue/second/snew/newval/supernew/');
            // });
            // it('can remove an existing value', function() {
            //    var newUrl = MaskResolver.calculateHref('first/:value', { clear: true });
            //    assert.strictEqual(newUrl, '/second/svalue/');
            // });
         });

         describe('fragments with queries', function() {
            beforeEach(function() {
               Data.setRelativeUrl('/path/#first=fvalue&second=svalue');
            });
            it('can change an existing value', function() {
               var newUrl = MaskResolver.calculateHref('#second=:value', { value: 'abc' });
               assert.strictEqual(newUrl, '/path/#first=fvalue&second=abc');
            });
         });
         
         /** Проверка вычисления url-адреса, когда используется корневая маска (с "/" вначале).
          * с опцией keepQuery query-часть url-адреса не должна очищаться */
         describe('keepQuery', function() {
            it('root url', function() {
               Data.setRelativeUrl('/?query=value');
               var newUrl = MaskResolver.calculateHref('/page/:pageId', { pageId: 'NewName', keepQuery: true });
               assert.strictEqual(newUrl, '/page/NewName?query=value');
            });
            it('simple url', function() {
               Data.setRelativeUrl('/page/Name?query=value');
               var newUrl = MaskResolver.calculateHref('/page/:pageId', { pageId: 'NewName', keepQuery: true });
               assert.strictEqual(newUrl, '/page/NewName?query=value');
            });
         });
      });

      describe('#calculateQueryHref', function() {
         it('add param', function () {
            var newUrl = MaskResolver.calculateQueryHref({param: 'value'}, '/path');
            assert.strictEqual(newUrl, '/path?param=value');
         });
         it('replace params', function () {
            var newUrl = MaskResolver.calculateQueryHref({param: 'newvalue'}, '/path?param=value');
            assert.strictEqual(newUrl, '/path?param=newvalue');
         });
         it('clear params', function () {
            var newUrl = MaskResolver.calculateQueryHref({replace: true}, '/path?query=value&param=value1');
            assert.strictEqual(newUrl, '/path');
         });
         it('clear and add params', function () {
            var newUrl = MaskResolver.calculateQueryHref({param: 'newvalue', replace: true},
                                                         '/path?query=value&param=value1');
            assert.strictEqual(newUrl, '/path?param=newvalue');
         });
      });
   });
});
/* eslint-enable max-nested-callbacks */
