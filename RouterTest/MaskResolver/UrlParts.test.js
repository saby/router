/* global assert */
define(['Router/_private/MaskResolver/UrlParts'], /**
 * @param UrlPartsMod
 * @param UrlParamsGetterMod
 */
function(UrlPartsMod, UrlParamsGetterMod) {
   const UrlParts = UrlPartsMod.UrlParts,
      emptyUrlParts = new UrlParts('');

   describe('Router/_private/MaskResolver/UrlParts', function() {
      describe('init UrlParts', function() {
         it('simple url', function () {
            let urlParts = new UrlParts('/');
            assert.strictEqual(urlParts.getPath(), '');
            assert.strictEqual(urlParts.getQuery(), '');
            assert.strictEqual(urlParts.getFragment(), '');
            urlParts = new UrlParts('/path/');
            assert.strictEqual(urlParts.getPath(), '/path');
            assert.strictEqual(urlParts.getQuery(), '');
            assert.strictEqual(urlParts.getFragment(), '');
         });
         it('query url', function () {
            let urlParts = new UrlParts('/?param=value');
            assert.strictEqual(urlParts.getPath(), '');
            assert.strictEqual(urlParts.getQuery(), '?param=value');
            assert.strictEqual(urlParts.getFragment(), '');
            urlParts = new UrlParts('/path/?param=value');
            assert.strictEqual(urlParts.getPath(), '/path');
            assert.strictEqual(urlParts.getQuery(), '?param=value');
            assert.strictEqual(urlParts.getFragment(), '');
         });
         it('fragment url', function () {
            let urlParts = new UrlParts('/#fragment=value');
            assert.strictEqual(urlParts.getPath(), '');
            assert.strictEqual(urlParts.getQuery(), '');
            assert.strictEqual(urlParts.getFragment(), '#fragment=value');
            urlParts = new UrlParts('/path/#fragment=value');
            assert.strictEqual(urlParts.getPath(), '/path');
            assert.strictEqual(urlParts.getQuery(), '');
            assert.strictEqual(urlParts.getFragment(), '#fragment=value');
         });
         it('query fragment url', function () {
            let urlParts = new UrlParts('/?param=value#fragment=value');
            assert.strictEqual(urlParts.getPath(), '');
            assert.strictEqual(urlParts.getQuery(), '?param=value');
            assert.strictEqual(urlParts.getFragment(), '#fragment=value');
            urlParts = new UrlParts('/path/?param=value#fragment=value');
            assert.strictEqual(urlParts.getPath(), '/path');
            assert.strictEqual(urlParts.getQuery(), '?param=value');
            assert.strictEqual(urlParts.getFragment(), '#fragment=value');
         });
      });
      describe('joinUrlParts', function() {
         it('simple url', function () {
            let urlParts = {path: '', query: '', fragment: ''};
            let url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/');
            urlParts = {path: '/path', query: '', fragment: ''};
            url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/path/');
         });
         it('query url', function () {
            let urlParts = {path: '', query: '?param=value', fragment: ''};
            let url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/?param=value');
            urlParts = {path: '/path', query: '?param=value', fragment: ''};
            url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/path/?param=value');
         });
         it('fragment url', function () {
            let urlParts = {path: '', query: '', fragment: '#fragment=value'};
            let url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/#fragment=value');
            urlParts = {path: '/path', query: '', fragment: '#fragment=value'};
            url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/path/#fragment=value');
         });
         it('query fragment url', function () {
            let urlParts = {path: '', query: '?param=value', fragment: '#fragment=value'};
            let url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/?param=value#fragment=value');
            urlParts = {path: '/path', query: '?param=value', fragment: '#fragment=value'};
            url = emptyUrlParts.join(urlParts);
            assert.strictEqual(url, '/path/?param=value#fragment=value');
         });
      });
   });
});
