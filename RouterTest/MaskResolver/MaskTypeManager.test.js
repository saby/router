/* global assert */

define(['Router/_private/MaskResolver/MaskTypeManager', 'Router/_private/MaskResolver/UrlParts'], /**
 * @param MaskTypeManagerMod
 * @param UrlPartsMod
 */
function(MaskTypeManagerMod, UrlPartsMod) {
   const MaskTypeManager = MaskTypeManagerMod.MaskTypeManager,
      MaskType = MaskTypeManagerMod.MaskType,
      UrlParts = UrlPartsMod.UrlParts;

   describe('Router/_private/MaskResolver/MaskTypeManager', function() {
      it('unknown mask', function () {
         const maskType = MaskTypeManager.calculateMaskType('param', new UrlParts('/param/pvalue'));
         assert.strictEqual(maskType, MaskType.Undefined);
      });
      describe('path mask', function() {
         it('simple url', function () {
            const maskType = MaskTypeManager.calculateMaskType('param/:value', new UrlParts('/param/pvalue'));
            assert.strictEqual(maskType, MaskType.Path);
         });
         it('url with fragment', function () {
            const maskType = MaskTypeManager.calculateMaskType('param/:value', new UrlParts('/param/pvalue#fragment/pvalue'));
            assert.strictEqual(maskType, MaskType.Path);
         });
      });
      describe('query mask', function() {
         it('simple url', function () {
            const maskType = MaskTypeManager.calculateMaskType('param=:value', new UrlParts('/?param=pvalue'));
            assert.strictEqual(maskType, MaskType.Query);
         });
         it('url with fragment', function () {
            const maskType = MaskTypeManager.calculateMaskType('param=:value', new UrlParts('/?param=pvalue#fragment=pvalue'));
            assert.strictEqual(maskType, MaskType.Query);
         });
      });
      it('path fragment mask', function () {
         const maskType = MaskTypeManager.calculateMaskType('param/:value', new UrlParts('/path/pvalue#param/pvalue'));
         assert.strictEqual(maskType, MaskType.PathFragment);
      });
      it('query fragment mask', function () {
         const maskType = MaskTypeManager.calculateMaskType('param=:value', new UrlParts('/?query=qvalue#param=pvalue'));
         assert.strictEqual(maskType, MaskType.QueryFragment);
      });
   });
});
