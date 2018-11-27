define([
   'Router/UrlRewriter',
   'RouterTest/resources/router.json'
], function(UrlRewriter, json) {
   var UrlRewriter = UrlRewriter.default;

   describe('Router/ServerRouting', function() {
      beforeEach(function() {
         UrlRewriter._prepare(json);
      });
      it('test rewriter results', function() {
         assert.equal(UrlRewriter.get('/'), '/OnlineSbisRu');
         assert.equal(UrlRewriter.get('/a'), '/a');
         assert.equal(UrlRewriter.get('/a/b'), '/ab');
         assert.equal(UrlRewriter.get('/a/b/c'), '/ab/c');
         assert.equal(UrlRewriter.get('/a/b/c/d'), '/abcd');
         assert.equal(UrlRewriter.get('/a/b/c/d/e'), '/abcd/e');
      });
   });
});
