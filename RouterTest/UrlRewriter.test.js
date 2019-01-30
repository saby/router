define([
   'Router/UrlRewriter',
   'RouterTest/resources/router'
], function(UrlRewriter, json) {
   var UrlRewriter = UrlRewriter.default;

   const tests = [
      {
         url: '/',
         result: '/OnlineSbisRu'
      },
      {
         url: '/a',
         result: '/a'
      },
      {
         url: '/a/b',
         result: '/ab'
      },
      {
         url: '/a/b/c',
         result: '/ab/c'
      },
      {
         url: '/a/b/c/d',
         result: '/abcd'
      },
      {
         url: '/a/b/c/d/e',
         result: '/abcd/e'
      }
   ];

   function runTests(testArr) {
      testArr.forEach(function(test) {
         assert.equal(UrlRewriter.get(test.url), test.result);
      });
   }

   describe('Router/ServerRouting', function() {
      beforeEach(function() {
         UrlRewriter._prepare(json);
      });
      it('rewrites the url', function() {
         runTests(tests);
      });
      it('ignores query in the url', function() {
         var
            queryString = '?paramA=true&paramB=false',
            queryTests = tests.map(function(test) {
               return {
                  url: test.url + queryString,
                  result: test.result + queryString
               };
            });

         runTests(queryTests);
      });
      it('ignores hash in the url', function() {
         var
            hashString = '#userid=00000111',
            hashTests = tests.map(function(test) {
               return {
                  url: test.url + hashString,
                  result: test.result + hashString
               };
            });

         runTests(hashTests);
      });
      it('ignores query and hash in the url if both are present', function() {
         var
            combinedString = '?paramA=true&paramB=false#userid=00000111',
            combinedTests = tests.map(function(test) {
               return {
                  url: test.url + combinedString,
                  result: test.result + combinedString
               }
            });

         runTests(combinedTests);
      });
   });
});
