/* global assert */
/* eslint-disable max-nested-callbacks */
define(['Router/_private/UrlModifirer'],
function(UrlModifirerMod) {
   describe('Router/_private/UrlModifirer', function() {
      const UrlModifirer = UrlModifirerMod.default;

      it('add', function() {
         const modifirer = new UrlModifirer('/');
         modifirer.add('contract');
         assert.strictEqual(modifirer.generate(), '/contract');
      });

      it('replace', function() {
         const modifirer = new UrlModifirer('/contract/one');
         modifirer.replace('contract/one', 'dialog/one');
         assert.strictEqual(modifirer.generate(), '/dialog/one');
      });

      it('add query', function() {
         const modifirer = new UrlModifirer('/');
         modifirer.addQuery('param=value');
         assert.strictEqual(modifirer.generate(), '/?param=value');
      });

      it('add query multiply', function() {
         const modifirer = new UrlModifirer('/contract');
         modifirer.addQuery('param=value');
         modifirer.addQuery('first=second');
         assert.strictEqual(modifirer.generate(), '/contract?param=value&first=second');
      });

      it('remove/add query', function() {
         const modifirer = new UrlModifirer('/contract?param=value');
         modifirer.removeQuery('param=value');
         modifirer.addQuery('first=second');
         assert.strictEqual(modifirer.generate(), '/contract?first=second');
      });

      it('replace query', function() {
         const modifirer = new UrlModifirer('/contract?param=value&second=value2');
         modifirer.replaceQuery('param=value&second=value2', 'a=b&b=c');
         assert.strictEqual(modifirer.generate(), '/contract?a=b&b=c');
      });

   });
});
/* eslint-enable max-nested-callbacks */
