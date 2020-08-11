/* global assert */
define(['Router/_private/MaskResolver/Helpers'], /**
 * @param HelpersMod
 */
function(HelpersMod) {
   const getParamsFromQueryString = HelpersMod.getParamsFromQueryString,
      encodeParam = HelpersMod.encodeParam,
      decodeParam = HelpersMod.decodeParam;

   describe('Router/_private/MaskResolver/Helpers', function() {
      describe('#getParamsFromQueryString', function() {
         it('mask string', function () {
            const params = getParamsFromQueryString('param=:value', true);
            assert.strictEqual(params.param, 'value');
         });
         it('url query string', function () {
            const params = getParamsFromQueryString('?param=value');
            assert.strictEqual(params.param, 'value');
         });
         it('url fragment string', function () {
            const params = getParamsFromQueryString('#param=value');
            assert.strictEqual(params.param, 'value');
         });
      });
      describe('#encodeParam', function() {
         it('value with space', function () {
            const res = encodeParam('this value');
            assert.strictEqual(res, 'this%20value');
         });
         it('value with slash', function () {
            const res = encodeParam('this/value');
            assert.strictEqual(res, 'this%2Fvalue');
         });
      });
      describe('#decodeParam', function() {
         it('value with space', function () {
            const res = decodeParam('this%20value');
            assert.strictEqual(res, 'this value');
         });
         it('value with slash', function () {
            const res = decodeParam('this%2Fvalue');
            assert.strictEqual(res, 'this/value');
         });
      });
   });
});
