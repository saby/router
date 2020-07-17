/* global assert */

define(['Router/_private/MaskResolver/MaskType', 'Router/_private/MaskResolver/UrlParts'], /**
 * @param MaskTypeMod
 * @param UrlPartsMod
 */
function(MaskTypeMod, UrlPartsMod) {
   const calculateMaskType = MaskTypeMod.calculateMaskType,
      MaskType = MaskTypeMod.MaskType,
      UrlParts = UrlPartsMod.UrlParts;

   describe('Router/_private/MaskResolver/MaskType', function() {
      it('unknown mask', function () {
         const maskType = calculateMaskType('param', new UrlParts('/param/pvalue'));
         assert.strictEqual(maskType.length, 1);
         assert.strictEqual(maskType[0].mask, 'param');
         assert.strictEqual(maskType[0].maskType, MaskType.Undefined);
      });
      describe('path mask', function() {
         it('simple url', function () {
            const maskType = calculateMaskType('param/:value', new UrlParts('/param/pvalue'));
            assert.strictEqual(maskType.length, 1);
            assert.strictEqual(maskType[0].mask, 'param/:value');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
         });
         it('url with fragment', function () {
            const maskType = calculateMaskType('param/:value', new UrlParts('/param/pvalue#fragment/pvalue'));
            assert.strictEqual(maskType.length, 1);
            assert.strictEqual(maskType[0].mask, 'param/:value');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
         });
      });
      describe('query mask', function() {
         it('simple url', function () {
            const maskType = calculateMaskType('param=:value', new UrlParts('/?param=pvalue'));
            assert.strictEqual(maskType.length, 1);
            assert.strictEqual(maskType[0].mask, 'param=:value');
            assert.strictEqual(maskType[0].maskType, MaskType.Query);
         });
         it('url with fragment', function () {
            const maskType = calculateMaskType('param=:value', new UrlParts('/?param=pvalue#fragment=pvalue'));
            assert.strictEqual(maskType.length, 1);
            assert.strictEqual(maskType[0].mask, 'param=:value');
            assert.strictEqual(maskType[0].maskType, MaskType.Query);
         });
      });
      it('path fragment mask', function () {
         const maskType = calculateMaskType('param/:value', new UrlParts('/path/pvalue#param/pvalue'));
         assert.strictEqual(maskType.length, 1);
         assert.strictEqual(maskType[0].mask, 'param/:value');
         assert.strictEqual(maskType[0].maskType, MaskType.PathFragment);
      });
      it('query fragment mask', function () {
         const maskType = calculateMaskType('param=:value', new UrlParts('/?query=qvalue#param=pvalue'));
         assert.strictEqual(maskType.length, 1);
         assert.strictEqual(maskType[0].mask, 'param=:value');
         assert.strictEqual(maskType[0].maskType, MaskType.QueryFragment);
      });

      describe('complicated masks', function() {
         it('path + query', function () {
            const maskType = calculateMaskType('path/:path?param=:value', new UrlParts('/path/pathValue?param=pvalue'));
            assert.strictEqual(maskType.length, 2);
            assert.strictEqual(maskType[0].mask, 'path/:path');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
            assert.strictEqual(maskType[1].mask, '?param=:value');
            assert.strictEqual(maskType[1].maskType, MaskType.Query);
         });
         it('path + path fragment', function () {
            const maskType = calculateMaskType('path/:path#fragment/:value',
                                               new UrlParts('/path/pathValue#fragment/fvalue'));
            assert.strictEqual(maskType.length, 2);
            assert.strictEqual(maskType[0].mask, 'path/:path');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
            assert.strictEqual(maskType[1].mask, '#fragment/:value');
            assert.strictEqual(maskType[1].maskType, MaskType.PathFragment);
         });
         it('path + query fragment', function () {
            const maskType = calculateMaskType('path/:path#fragment=:value',
                                               new UrlParts('/path/pathValue#fragment=fvalue'));
            assert.strictEqual(maskType.length, 2);
            assert.strictEqual(maskType[0].mask, 'path/:path');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
            assert.strictEqual(maskType[1].mask, '#fragment=:value');
            assert.strictEqual(maskType[1].maskType, MaskType.QueryFragment);
         });
         it('query + path fragment', function () {
            const maskType = calculateMaskType('query=:qvalue#fragment/:value',
                                               new UrlParts('/?query=qvalue#fragment/fvalue'));
            assert.strictEqual(maskType.length, 2);
            assert.strictEqual(maskType[0].mask, 'query=:qvalue');
            assert.strictEqual(maskType[0].maskType, MaskType.Query);
            assert.strictEqual(maskType[1].mask, '#fragment/:value');
            assert.strictEqual(maskType[1].maskType, MaskType.PathFragment);
         });
         it('query + query fragment', function () {
            const maskType = calculateMaskType('query=:qvalue#fragment=:value',
                                               new UrlParts('/?query=qvalue#fragment=fvalue'));
            assert.strictEqual(maskType.length, 2);
            assert.strictEqual(maskType[0].mask, 'query=:qvalue');
            assert.strictEqual(maskType[0].maskType, MaskType.Query);
            assert.strictEqual(maskType[1].mask, '#fragment=:value');
            assert.strictEqual(maskType[1].maskType, MaskType.QueryFragment);
         });
         it('path + query + path fragment', function () {
            const maskType = calculateMaskType('path/:path?query=:qvalue#fragment/:value',
                                               new UrlParts('/path/pathValue?query=qvalue#fragment/fvalue'));
            assert.strictEqual(maskType.length, 3);
            assert.strictEqual(maskType[0].mask, 'path/:path');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
            assert.strictEqual(maskType[1].mask, '?query=:qvalue');
            assert.strictEqual(maskType[1].maskType, MaskType.Query);
            assert.strictEqual(maskType[2].mask, '#fragment/:value');
            assert.strictEqual(maskType[2].maskType, MaskType.PathFragment);
         });
         it('path + query + query fragment', function () {
            const maskType = calculateMaskType('path/:path?query=:qvalue#fragment=:value',
                                               new UrlParts('/path/pathValue?query=qvalue#fragment=fvalue'));
            assert.strictEqual(maskType.length, 3);
            assert.strictEqual(maskType[0].mask, 'path/:path');
            assert.strictEqual(maskType[0].maskType, MaskType.Path);
            assert.strictEqual(maskType[1].mask, '?query=:qvalue');
            assert.strictEqual(maskType[1].maskType, MaskType.Query);
            assert.strictEqual(maskType[2].mask, '#fragment=:value');
            assert.strictEqual(maskType[2].maskType, MaskType.QueryFragment);
         });
      });
   });
});
