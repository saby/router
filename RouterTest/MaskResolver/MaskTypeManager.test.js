/* global assert */
define(['Router/_private/MaskResolver/MaskTypeManager'], /**
 * @param MaskTypeManagerMod
 */
function(MaskTypeManagerMod) {
   const MaskTypeManager = MaskTypeManagerMod.MaskTypeManager,
      MaskType = MaskTypeManagerMod.MaskType;

   describe('Router/_private/MaskResolver/MaskTypeManager', function() {
      it('unknown mask', function () {
         const maskType = MaskTypeManager.calculateMaskType('param', '/param/pvalue');
         assert.strictEqual(maskType, MaskType.Undefined);
      });
      describe('path mask', function() {
         it('simple url', function () {
            const maskType = MaskTypeManager.calculateMaskType('param/:value', '/param/pvalue');
            assert.strictEqual(maskType, MaskType.Path);
         });
         it('url with fragment', function () {
            const maskType = MaskTypeManager.calculateMaskType('param/:value', '/param/pvalue#fragment/pvalue');
            assert.strictEqual(maskType, MaskType.Path);
         });
      });
      describe('query mask', function() {
         it('simple url', function () {
            const maskType = MaskTypeManager.calculateMaskType('param=:value', '/?param=pvalue');
            assert.strictEqual(maskType, MaskType.Query);
         });
         it('url with fragment', function () {
            const maskType = MaskTypeManager.calculateMaskType('param=:value', '/?param=pvalue#fragment=pvalue');
            assert.strictEqual(maskType, MaskType.Query);
         });
      });
      it('path fragment mask', function () {
         const maskType = MaskTypeManager.calculateMaskType('param/:value', '/path/pvalue#param/pvalue');
         assert.strictEqual(maskType, MaskType.PathFragment);
      });
      it('query fragment mask', function () {
         const maskType = MaskTypeManager.calculateMaskType('param=:value', '/?query=qvalue#param=pvalue');
         assert.strictEqual(maskType, MaskType.QueryFragment);
      });
   });
});
