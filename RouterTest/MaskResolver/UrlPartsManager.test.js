/* global assert */
define(['Router/_private/MaskResolver/UrlPartsManager'], /**
 * @param UrlPartsManagerMod
 * @param UrlParamsGetterMod
 */
function(UrlPartsManagerMod, UrlParamsGetterMod) {
   const UrlPartsManager = UrlPartsManagerMod.UrlPartsManager;

   describe('Router/_private/MaskResolver/UrlPartsManager', function() {
      describe('getUrlParts', function() {
         it('simple url', function () {
            let urlParts = UrlPartsManager.getUrlParts('/');
            assert.strictEqual(urlParts.path, '');
            assert.strictEqual(urlParts.query, '');
            assert.strictEqual(urlParts.fragment, '');
            urlParts = UrlPartsManager.getUrlParts('/path/');
            assert.strictEqual(urlParts.path, '/path');
            assert.strictEqual(urlParts.query, '');
            assert.strictEqual(urlParts.fragment, '');
         });
         it('query url', function () {
            let urlParts = UrlPartsManager.getUrlParts('/?param=value');
            assert.strictEqual(urlParts.path, '');
            assert.strictEqual(urlParts.query, '?param=value');
            assert.strictEqual(urlParts.fragment, '');
            urlParts = UrlPartsManager.getUrlParts('/path/?param=value');
            assert.strictEqual(urlParts.path, '/path');
            assert.strictEqual(urlParts.query, '?param=value');
            assert.strictEqual(urlParts.fragment, '');
         });
         it('fragment url', function () {
            let urlParts = UrlPartsManager.getUrlParts('/#fragment=value');
            assert.strictEqual(urlParts.path, '');
            assert.strictEqual(urlParts.query, '');
            assert.strictEqual(urlParts.fragment, '#fragment=value');
            urlParts = UrlPartsManager.getUrlParts('/path/#fragment=value');
            assert.strictEqual(urlParts.path, '/path');
            assert.strictEqual(urlParts.query, '');
            assert.strictEqual(urlParts.fragment, '#fragment=value');
         });
         it('query fragment url', function () {
            let urlParts = UrlPartsManager.getUrlParts('/?param=value#fragment=value');
            assert.strictEqual(urlParts.path, '');
            assert.strictEqual(urlParts.query, '?param=value');
            assert.strictEqual(urlParts.fragment, '#fragment=value');
            urlParts = UrlPartsManager.getUrlParts('/path/?param=value#fragment=value');
            assert.strictEqual(urlParts.path, '/path');
            assert.strictEqual(urlParts.query, '?param=value');
            assert.strictEqual(urlParts.fragment, '#fragment=value');
         });
      });
      describe('joinUrlParts', function() {
         it('simple url', function () {
            let urlParts = {path: '', query: '', fragment: ''};
            let url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/');
            urlParts = {path: '/path', query: '', fragment: ''};
            url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/path/');
         });
         it('query url', function () {
            let urlParts = {path: '', query: '?param=value', fragment: ''};
            let url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/?param=value');
            urlParts = {path: '/path', query: '?param=value', fragment: ''};
            url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/path/?param=value');
         });
         it('fragment url', function () {
            let urlParts = {path: '', query: '', fragment: '#fragment=value'};
            let url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/#fragment=value');
            urlParts = {path: '/path', query: '', fragment: '#fragment=value'};
            url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/path/#fragment=value');
         });
         it('query fragment url', function () {
            let urlParts = {path: '', query: '?param=value', fragment: '#fragment=value'};
            let url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/?param=value#fragment=value');
            urlParts = {path: '/path', query: '?param=value', fragment: '#fragment=value'};
            url = UrlPartsManager.joinUrlParts(urlParts);
            assert.strictEqual(url, '/path/?param=value#fragment=value');
         });
      });
   });
});
