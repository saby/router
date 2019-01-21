define(['Router/UrlRewriter', 'RouterTest/resources/router'], function(UrlRewriter, json) {
   describe('Router/UrlRewriter', function() {
      beforeEach(function() {
         UrlRewriter._prepareRoutes(json);
      });

      it('rewrites the index route correctly', function() {
         assert.equal(UrlRewriter.get('/'), '/OnlineSbisRu');
      });

      it('rewrites other routes correctly', function() {
         assert.equal(UrlRewriter.get('/a'), '/a');
         assert.equal(UrlRewriter.get('/a/b'), '/ab');
         assert.equal(UrlRewriter.get('/a/b/c'), '/ab/c');
         assert.equal(UrlRewriter.get('/a/b/c/d'), '/abcd');
         assert.equal(UrlRewriter.get('/a/b/c/d/e'), '/abcd/e');
      });
   });
});
