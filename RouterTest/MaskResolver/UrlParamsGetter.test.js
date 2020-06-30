/* global assert */
define(['Router/_private/MaskResolver/UrlPartsManager', 'Router/_private/MaskResolver/UrlParamsGetter'], /**
 * @param UrlPartsManagerMod
 * @param UrlParamsGetterMod
 */
function(UrlPartsManagerMod, UrlParamsGetterMod) {
   const UrlPartsManager = UrlPartsManagerMod.UrlPartsManager,
       UrlParamsGetter = UrlParamsGetterMod.UrlParamsGetter,
       PathParams = UrlParamsGetterMod.PathParams,
       QueryParams = UrlParamsGetterMod.QueryParams;

   describe('Router/_private/MaskResolver/UrlParamsGetter', function() {
      describe('UrlParamsGetter', function() {
         it('simple url', function () {
            const params = new UrlParamsGetter('param/:valueId', '/path/param/value').get();
            assert.strictEqual(params.valueId, 'value');
         });
         it('query url', function () {
            const params = new UrlParamsGetter('param=:valueId', '/path/?param=value').get();
            assert.strictEqual(params.valueId, 'value');
         });
         it('path fragment url', function () {
            const params = new UrlParamsGetter('param/:valueId', '/path/#param/value').get();
            assert.strictEqual(params.valueId, 'value');
         });
         it('query fragment url', function () {
            const params = new UrlParamsGetter('param=:valueId', '/path/#param=value').get();
            assert.strictEqual(params.valueId, 'value');
         });
      });
      describe('PathParams', function() {
         it('simple url', function () {
            const urlParts = UrlPartsManager.getUrlParts('/path/param/value');
            const params = PathParams.calculateParams('param/:valueId', urlParts.path);
            assert.strictEqual(params[0].maskId, 'valueId');
            assert.strictEqual(params[0].urlValue, 'value');
            assert.strictEqual(params[0].urlId, 'param');
         });
         it('fragment url', function () {
            const urlParts = UrlPartsManager.getUrlParts('/path/#param/value');
            const params = PathParams.calculateParams('param/:valueId', urlParts.fragment);
            assert.strictEqual(params[0].maskId, 'valueId');
            assert.strictEqual(params[0].urlValue, 'value');
            assert.strictEqual(params[0].urlId, 'param');
         });
      });
      describe('QueryParams', function() {
         it('simple url', function () {
            const urlParts = UrlPartsManager.getUrlParts('/path/?param=value');
            const params = QueryParams.calculateParams('param=:valueId', urlParts.query);
            assert.strictEqual(params[0].maskId, 'valueId');
            assert.strictEqual(params[0].urlValue, 'value');
            assert.strictEqual(params[0].urlId, 'param');
         });
         it('fragment url', function () {
            const urlParts = UrlPartsManager.getUrlParts('/path/#param=value');
            const params = QueryParams.calculateParams('param=:valueId', urlParts.fragment);
            assert.strictEqual(params[0].maskId, 'valueId');
            assert.strictEqual(params[0].urlValue, 'value');
            assert.strictEqual(params[0].urlId, 'param');
         });
      });
   });
});
