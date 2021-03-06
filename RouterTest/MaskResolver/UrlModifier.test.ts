/**
 * Здесь описаны только основные тесты. Более тщательные тесты описаны в модуле \RouterTest\MaskResolver.test.js
 */
import { assert } from 'chai';
import { UrlModifier } from 'Router/_private/MaskResolver/UrlModifier';


describe('Router/_private/MaskResolver/UrlModifier', () => {
   describe('singleparam path url', () => {
      it('add value', () => {
         let modifier = new UrlModifier('param/:valueId', {valueId: 'newvalue'}, '/');
         assert.strictEqual(modifier.modify(), '/param/newvalue');
         modifier = new UrlModifier('param/:valueId', {valueId: 'newvalue'}, '/path/');
         assert.strictEqual(modifier.modify(), '/path/param/newvalue/');
      });
      it('add complicated value', () => {
         const modifier = new UrlModifier('update/:page', {page: 'updates'}, '/update/');
         assert.strictEqual(modifier.modify(), '/update/updates/');
      });
      it('change value', () => {
         let modifier = new UrlModifier('param/:valueId', {valueId: 'newvalue'}, '/param/value/');
         assert.strictEqual(modifier.modify(), '/param/newvalue/');
         modifier = new UrlModifier('path/param/:valueId', {valueId: 'newvalue'}, '/path/old/');
         assert.strictEqual(modifier.modify(), '/path/param/newvalue/');
         modifier = new UrlModifier('path/param/:valueId/second/:svalueId',
                                    {valueId: 'newvalue'}, '/path/old/second/sold');
         assert.strictEqual(modifier.modify(), '/path/param/newvalue');
      });
      it('change complicated value', () => {
         let modifier = new UrlModifier('/pbx-admin/:valueId',
                                          {valueId: 'server'}, '/pbx-admin/pbx');
         assert.strictEqual(modifier.modify(), '/pbx-admin/server');
         modifier = new UrlModifier('tab/:tab', {tab: 'employee-stats'},
                                    '/OnlineSbisRu/money/expense-reports/tab/expense-reports/');
         assert.strictEqual(modifier.modify(), '/OnlineSbisRu/money/expense-reports/tab/employee-stats/');

         // лидирующий слеш
         modifier = new UrlModifier('/group/:groupId/page/:pageId', {pageId: 'new-page'}, '/page/business-groups');
         assert.strictEqual(modifier.modify(), '/page/new-page');
         modifier = new UrlModifier('/group/:groupId/page/:pageId', {pageId: 'new-page'}, '/page/groups');
         assert.strictEqual(modifier.modify(), '/page/new-page');
         // без лидирующего слеша
         modifier = new UrlModifier('group/:groupId/page/:pageId', {pageId: 'new-page'}, '/page/business-groups');
         assert.strictEqual(modifier.modify(), '/page/new-page');
         modifier = new UrlModifier('group/:groupId/page/:pageId', {pageId: 'new-page'}, '/page/groups');
         assert.strictEqual(modifier.modify(), '/page/new-page');

         modifier = new UrlModifier('tab/:tab', {tab: 'newtab'}, '/path/tab/oldtab/tab/');
         assert.strictEqual(modifier.modify(), '/path/tab/newtab/tab/');
      });
      it('add value and change value', () => {
         const modifier = new UrlModifier('param/:valueId/second/:sId', {valueId: 'newvalue', sId: 'svalue'},
                                          '/path/param/value/');
         assert.strictEqual(modifier.modify(), '/path/param/newvalue/second/svalue/');
      });
      it('remove value', () => {
         let modifier = new UrlModifier('param/:valueId', {}, '/path/param/value');
         assert.strictEqual(modifier.modify(), '/path');
         modifier = new UrlModifier('param/:valueId', {}, '/path/param/value/second/svalue/');
         assert.strictEqual(modifier.modify(), '/path/second/svalue/');
      });
      it('remove complicated value', () => {
         const modifier = new UrlModifier('update/:page', {}, '/update/');
         assert.strictEqual(modifier.modify(), '/');
      });
      it('replace url', () => {
         let modifier = new UrlModifier('/', {}, '/path/param/value');
         assert.strictEqual(modifier.modify(), '/');
         modifier = new UrlModifier('/newpath/:valueId', {valueId: 'value'}, '/path/param/value');
         assert.strictEqual(modifier.modify(), '/newpath/value');
         modifier = new UrlModifier('/:location', {location: 'website'}, '/path/param/value?test=value');
         assert.strictEqual(modifier.modify(), '/website');
         modifier = new UrlModifier('/update/:page', {page: 'updates'}, '/update/');
         assert.strictEqual(modifier.modify(), '/update/updates/');
      });
      it('path with file extension', () => {
         let modifier = new UrlModifier('page/:pageId', {pageId: 'new.html'}, '/page/old.html');
         assert.strictEqual(modifier.modify(), '/page/new.html');
         modifier = new UrlModifier('page/:pageId', {pageId: 'new.html'}, '/page/old/');
         assert.strictEqual(modifier.modify(), '/page/new.html');
         modifier = new UrlModifier('page/:pageId?query=:queryId',
                                    {pageId: 'new.html', queryId: 'qvalue'}, '/page/old/');
         assert.strictEqual(modifier.modify(), '/page/new.html?query=qvalue');
      });
   });

   describe('multiparam path url', () => {
      it('add value', () => {
         const modifier = new UrlModifier('param/:valueId/:svalueId', {valueId: 'newvalue', svalueId: 'snewvalue'},
                                    '/path/param/value/');
         assert.strictEqual(modifier.modify(), '/path/param/newvalue/snewvalue/');
      });
      it('change value', () => {
         const modifier = new UrlModifier('param/:valueId/:svalueId', {valueId: 'newvalue', svalueId: 'snewvalue'},
                                          '/param/value/svalue/');
         assert.strictEqual(modifier.modify(), '/param/newvalue/snewvalue/');
      });
      it('add value and change value', () => {
         const modifier = new UrlModifier('param/:valueId/:svalueId/second/:sId',
                                          {valueId: 'newvalue', svalueId: 'snewvalue', sId: 'svalue'},
                                          '/path/param/value/');
         assert.strictEqual(modifier.modify(), '/path/param/newvalue/snewvalue/second/svalue/');
      });
      it('remove value', () => {
         let modifier = new UrlModifier('param/:valueId/:svalueId', {valueId: 'newvalue'}, '/param/value/svalue/');
         assert.strictEqual(modifier.modify(), '/param/newvalue/');
         modifier = new UrlModifier('param/:valueId/:svalueId', {}, '/path/param/value/svalue/');
         assert.strictEqual(modifier.modify(), '/path/');
      });
      it('replace url', () => {
         const modifier = new UrlModifier('/newpath/:valueId/:svalueId',
                                          {valueId: 'newvalue', svalueId: 'snewvalue'},
                                          '/param/value/svalue');
         assert.strictEqual(modifier.modify(), '/newpath/newvalue/snewvalue');
      });
   });

   describe('query url', () => {
      it('add value', () => {
         let modifier = new UrlModifier('param=:valueId', {valueId: 'newvalue'}, '/');
         assert.strictEqual(modifier.modify(), '/?param=newvalue');
         modifier = new UrlModifier('param=:valueId', {valueId: 'newvalue'}, '/path/');
         assert.strictEqual(modifier.modify(), '/path/?param=newvalue');
      });
      it('change value', () => {
         const modifier = new UrlModifier('param=:valueId', {valueId: 'newvalue'}, '/?param=value');
         assert.strictEqual(modifier.modify(), '/?param=newvalue');
      });
      it('add value and change value', () => {
         const modifier = new UrlModifier('param=:valueId&second=:sId', {valueId: 'newvalue', sId: 'svalue'},
                                          '/path/?param=value');
         assert.strictEqual(modifier.modify(), '/path/?param=newvalue&second=svalue');
      });
      it('remove an existing value', () => {
         let modifier = new UrlModifier('param=:valueId', {}, '/path/?param=value');
         assert.strictEqual(modifier.modify(), '/path/');
         modifier = new UrlModifier('param=:valueId', {}, '/path/?param=value&second=svalue');
         assert.strictEqual(modifier.modify(), '/path/?second=svalue');
         // проверка удаления несуществующего параметра, но в текущем url есть параметр с двоеточием в значении
         modifier = new UrlModifier('tab=:tab', {clear: true}, '/auth/?rel=http://pre-test-online.sbis.ru/events');
         assert.strictEqual(modifier.modify(), '/auth/?rel=http://pre-test-online.sbis.ru/events');
      });
      it('replace url', () => {
         const modifier = new UrlModifier('newpath=:valueId', {valueId: 'value', replace: true}, '/path/?param=value');
         assert.strictEqual(modifier.modify(), '/?newpath=value');
      });
   });

   describe('singleparam path fragment url', () => {
      it('add value', () => {
         let modifier = new UrlModifier('#param/:valueId', {valueId: 'newvalue'}, '/');
         assert.strictEqual(modifier.modify(), '/#param/newvalue');
         modifier = new UrlModifier('#param/:valueId', {valueId: 'newvalue'}, '/path/');
         assert.strictEqual(modifier.modify(), '/path/#param/newvalue');
      });
      it('change value', () => {
         const modifier = new UrlModifier('param/:valueId', {valueId: 'newvalue'}, '/#param/value');
         assert.strictEqual(modifier.modify(), '/#param/newvalue');
      });
      it('add value and change value', () => {
         const modifier = new UrlModifier('param/:valueId/second/:sId', {valueId: 'newvalue', sId: 'svalue'},
                                          '/path/#param/value');
         assert.strictEqual(modifier.modify(), '/path/#param/newvalue/second/svalue');
      });
      it('remove value', () => {
         let modifier = new UrlModifier('param/:valueId', {}, '/path/#param/value');
         assert.strictEqual(modifier.modify(), '/path/');
         modifier = new UrlModifier('param/:valueId', {}, '/path/#param/value/second/svalue');
         assert.strictEqual(modifier.modify(), '/path/#second/svalue');
      });
      it('replace url', () => {
         const modifier = new UrlModifier('#newpath/:valueId', {valueId: 'value', replace: true}, '/path/param/value');
         assert.strictEqual(modifier.modify(), '/#newpath/value');
      });
   });

   describe('multiparam path fragment url', () => {
      it('add value', () => {
         const modifier = new UrlModifier('param/:valueId/:svalueId', {valueId: 'newvalue', svalueId: 'snewvalue'},
                                    '/path/#param/value');
         assert.strictEqual(modifier.modify(), '/path/#param/newvalue/snewvalue');
      });
      it('change value', () => {
         const modifier = new UrlModifier('param/:valueId/:svalueId', {valueId: 'newvalue', svalueId: 'snewvalue'},
                                          '/#param/value/svalue');
         assert.strictEqual(modifier.modify(), '/#param/newvalue/snewvalue');
      });
      it('add value and change value', () => {
         const modifier = new UrlModifier('param/:valueId/:svalueId/second/:sId',
                                          {valueId: 'newvalue', svalueId: 'snewvalue', sId: 'svalue'},
                                          '/path/#param/value');
         assert.strictEqual(modifier.modify(), '/path/#param/newvalue/snewvalue/second/svalue');
      });
      it('remove value', () => {
         let modifier = new UrlModifier('param/:valueId/:svalueId', {valueId: 'newvalue'}, '/#param/value/svalue');
         assert.strictEqual(modifier.modify(), '/#param/newvalue');
         modifier = new UrlModifier('param/:valueId/:svalueId', {}, '/path/#param/value/svalue');
         assert.strictEqual(modifier.modify(), '/path/');
      });
      it('replace url', () => {
         const modifier = new UrlModifier('#newpath/:valueId/:svalueId',
                                          {valueId: 'newvalue', svalueId: 'snewvalue', replace: true},
                                          '/param/#value/svalue');
         assert.strictEqual(modifier.modify(), '/#newpath/newvalue/snewvalue');
      });
   });

   describe('query fragment url', () => {
      it('add value', () => {
         let modifier = new UrlModifier('#param=:valueId', {valueId: 'newvalue'}, '/');
         assert.strictEqual(modifier.modify(), '/#param=newvalue');
         modifier = new UrlModifier('#param=:valueId', {valueId: 'newvalue'}, '/path/');
         assert.strictEqual(modifier.modify(), '/path/#param=newvalue');
      });
      it('change value', () => {
         const modifier = new UrlModifier('#param=:valueId', {valueId: 'newvalue'}, '/#param=value');
         assert.strictEqual(modifier.modify(), '/#param=newvalue');
      });
      it('add value and change value', () => {
         const modifier = new UrlModifier('#param=:valueId&second=:sId', {valueId: 'newvalue', sId: 'svalue'},
                                          '/path/#param=value');
         assert.strictEqual(modifier.modify(), '/path/#param=newvalue&second=svalue');
      });
      it('remove value', () => {
         let modifier = new UrlModifier('#param=:valueId', {}, '/path/#param=value');
         assert.strictEqual(modifier.modify(), '/path/');
         modifier = new UrlModifier('#param=:valueId', {}, '/path/#param=value&second=svalue');
         assert.strictEqual(modifier.modify(), '/path/#second=svalue');
      });
      it('replace url', () => {
         const modifier = new UrlModifier('#newpath=:valueId', {valueId: 'value', replace: true}, '/path/#param=value');
         assert.strictEqual(modifier.modify(), '/#newpath=value');
      });
   });

   describe('complicated mask', () => {
      describe('path + query', () => {
         it('add value', () => {
            let modifier = new UrlModifier('second/:svalue?query=:qvalue',
                                             {svalue: 'newvalue', qvalue: 'newquery'}, '/path/param/pvalue');
            assert.strictEqual(modifier.modify(), '/path/param/pvalue/second/newvalue?query=newquery');
            modifier = new UrlModifier('second/:svalue?query=:qvalue',
                                       {svalue: 'newvalue', qvalue: 'newquery'}, '/path?oldQuery=value');
            assert.strictEqual(modifier.modify(), '/path/second/newvalue?oldQuery=value&query=newquery');
         });
         it('change value', () => {
            const modifier = new UrlModifier('shop/:guid/tab/:tab?mode=:mode',
                                             {guid: 'pamagiti', tab: 'about', mode: 'edit'},
                                             '/shop/pamagiti/tab/about?mode=edit');
            assert.strictEqual(modifier.modify(), '/shop/pamagiti/tab/about?mode=edit');
         });
         it('add value and change value', () => {
            const modifier = new UrlModifier('second/:svalue?query=:qvalue&oldQuery=:oldQvalue',
                                             {svalue: 'newvalue', qvalue: 'value', oldQvalue: 'newQvalue'},
                                             '/path?oldQuery=value');
            assert.strictEqual(modifier.modify(), '/path/second/newvalue?oldQuery=newQvalue&query=value');
         });
         it('remove value | remove & change value', () => {
            let modifier = new UrlModifier('param/:pvalue?query=:qvalue', {}, '/path/param/value?query=value');
            assert.strictEqual(modifier.modify(), '/path');
            modifier = new UrlModifier('param/:pvalue?query=:qvalue', {pvalue: 'value'},
                                       '/path/param/value?query=qvalue');
            assert.strictEqual(modifier.modify(), '/path/param/value');
         });
         it('replace url', () => {
            const modifier = new UrlModifier('/param/:pvalue/second/:svalue?query=:qvalue',
                                             {pvalue: 'value', svalue: 'newvalue', qvalue: 'qvalue'},
                                             '/path/first/fvalue#fragment=value');
            assert.strictEqual(modifier.modify(), '/param/value/second/newvalue?query=qvalue');
         });
      });
      describe('path + query fragment', () => {
         it('add value', () => {
            let modifier = new UrlModifier('second/:svalue#fragment=:fvalue',
                                             {svalue: 'newvalue', fvalue: 'newfragment'}, '/path/param/pvalue');
            assert.strictEqual(modifier.modify(), '/path/param/pvalue/second/newvalue#fragment=newfragment');
            modifier = new UrlModifier('second/:svalue#fragment=:fvalue',
                                       {svalue: 'newvalue', fvalue: 'newfragment'}, '/path#oldFragment=value');
            assert.strictEqual(modifier.modify(), '/path/second/newvalue#oldFragment=value&fragment=newfragment');
         });
         it('change value', () => {
            const modifier = new UrlModifier('param/:pvalue/tab/:tab#mode=:mode',
                                             {pvalue: 'pvalue', tab: 'about', mode: 'edit'},
                                             '/param/pvalue/tab/about#mode=delete');
            assert.strictEqual(modifier.modify(), '/param/pvalue/tab/about#mode=edit');
         });
         it('add value and change value', () => {
            const modifier = new UrlModifier('second/:svalue#fragment=:fvalue&oldFragment=:oldFvalue',
                                             {svalue: 'newvalue', fvalue: 'value', oldFvalue: 'newFvalue'},
                                             '/path#oldFragment=value');
            assert.strictEqual(modifier.modify(), '/path/second/newvalue#oldFragment=newFvalue&fragment=value');
         });
         it('remove value | remove & change value', () => {
            let modifier = new UrlModifier('param/:pvalue#fragment=:fvalue', {}, '/path/param/value#fragment=value');
            assert.strictEqual(modifier.modify(), '/path');
            modifier = new UrlModifier('param/:pvalue#fragment=:fvalue', {fvalue: 'value'},
                                       '/path/param/value#fragment=fvalue');
            assert.strictEqual(modifier.modify(), '/path#fragment=value');
         });
         it('replace url', () => {
            const modifier = new UrlModifier('/param/:pvalue/second/:svalue#fragment=:fvalue',
                                             {pvalue: 'value', svalue: 'newvalue', fvalue: 'fvalue'},
                                             '/path/first/fvalue#fragment=value');
            assert.strictEqual(modifier.modify(), '/param/value/second/newvalue#fragment=fvalue');
         });
      });
      describe('query + path fragment', () => {
         it('add value', () => {
            let modifier = new UrlModifier('query=:qvalue#fragment/:fvalue',
                                             {qvalue: 'newvalue', fvalue: 'newfragment'}, '/path/');
            assert.strictEqual(modifier.modify(), '/path/?query=newvalue#fragment/newfragment');
            modifier = new UrlModifier('query=:qvalue#fragment/:fvalue',
                                       {qvalue: 'newvalue', fvalue: 'newfragment'}, '/path#oldFragment/value');
            assert.strictEqual(modifier.modify(), '/path?query=newvalue#oldFragment/value/fragment/newfragment');
         });
         it('change value', () => {
            const modifier = new UrlModifier('query=:qvalue&tab=:tab#mode/:mode',
                                             {qvalue: 'qvalue', tab: 'about', mode: 'edit'},
                                             '/?query=qvalue&tab=about#mode/delete');
            assert.strictEqual(modifier.modify(), '/?query=qvalue&tab=about#mode/edit');
         });
         it('add value and change value', () => {
            const modifier = new UrlModifier('query=:qvalue#fragment/:fvalue/oldFragment/:oldFvalue',
                                             {qvalue: 'newvalue', fvalue: 'value', oldFvalue: 'newFvalue'},
                                             '/path#oldFragment/value');
            assert.strictEqual(modifier.modify(), '/path?query=newvalue#oldFragment/newFvalue/fragment/value');
         });
         it('remove value | remove & change value', () => {
            let modifier = new UrlModifier('query=:qvalue#fragment/:fvalue', {}, '/path/?query=value#fragment/value');
            assert.strictEqual(modifier.modify(), '/path/');
            modifier = new UrlModifier('query=:qvalue#fragment/:fvalue', {qvalue: 'value'},
                                       '/path/?query=value#fragment/fvalue');
            assert.strictEqual(modifier.modify(), '/path/?query=value');
         });
         it('replace url', () => {
            const modifier = new UrlModifier('/?query=:qvalue&second=:svalue#fragment/:fvalue',
                                             {qvalue: 'value', svalue: 'newvalue', fvalue: 'fvalue'},
                                             '/path/?first=fvalue#fragment/value');
            assert.strictEqual(modifier.modify(), '/?query=value&second=newvalue#fragment/fvalue');
         });
      });
   });
});
