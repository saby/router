/* global assert */
define(['Router/router', 'RouterTest/resources/router'], /**
 * @param { import('../Router/router') } Router
 * @param { import('./resources/router') } json
 */
function(Router, json) {
   var UrlRewriter = Router.UrlRewriter,
      tests = [
         {
            url: '/',
            result: '/OnlineSbisRu'
         },
         {
            url: '/12345',
            result: '/OnlineSbisRu/12345'
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
      ],
      testsReverse = [
         {
            url: '/OnlineSbisRu',
            result: '/'
         },
         {
            url: '/OnlineSbisRu/12345',
            result: '/12345'
         },
         {
            url: '/a',
            result: '/a'
         },
         {
            url: '/ab',
            result: '/a/b'
         },
         {
            url: '/ab/c',
            result: '/a/b/c'
         },
         {
            url: '/abcd',
            result: '/a/b/c/d'
         },
         {
            url: '/abcd/e',
            result: '/a/b/c/d/e'
         }
      ];

   function runTests(testArr) {
      testArr.forEach(function(test) {
         assert.equal(UrlRewriter.get(test.url), test.result);
      });
   }

   function runTestsReverse(testArr) {
      testArr.forEach(function(test) {
         assert.equal(UrlRewriter.getReverse(test.url), test.result);
      });
   }

   describe('Router/UrlRewriter', function() {
      beforeEach(function() {
         UrlRewriter._prepareRoutes(json);
      });

      it('does not throw if routes.json did not load', function() {
         assert.doesNotThrow(UrlRewriter._prepareRoutes.bind(UrlRewriter, null));
         assert.doesNotThrow(UrlRewriter._prepareRoutes.bind(UrlRewriter, undefined));
         assert.doesNotThrow(UrlRewriter._prepareRoutes.bind(UrlRewriter, {}));
      });

      describe('forward rewrite', function() {
         it('rewrites the url', function() {
            runTests(tests);
         });

         it('ignores query in the url', function() {
            var queryString = '?paramA=true&paramB=false',
               queryTests = tests.map(function(test) {
                  return {
                     url: test.url + queryString,
                     result: test.result + queryString
                  };
               });

            runTests(queryTests);
         });

         it('ignores hash in the url', function() {
            var hashString = '#userid=00000111',
               hashTests = tests.map(function(test) {
                  return {
                     url: test.url + hashString,
                     result: test.result + hashString
                  };
               });

            runTests(hashTests);
         });

         it('ignores query and hash in the url if both are present', function() {
            var combinedString = '?paramA=true&paramB=false#userid=00000111',
               combinedTests = tests.map(function(test) {
                  return {
                     url: test.url + combinedString,
                     result: test.result + combinedString
                  };
               });

            runTests(combinedTests);
         });

         it('returns urls as is if routes.json did not load', function() {
            UrlRewriter._prepareRoutes(null);

            var resEqUrl = tests.map(function(test) {
               return {
                  url: test.url,
                  result: test.url
               };
            });

            runTests(resEqUrl);
         });
      });

      describe('reverse rewrite', function() {
         it('rewrites the url', function() {
            runTestsReverse(testsReverse);
         });

         it('ignores query in the url', function() {
            var queryString = '?paramA=true&paramB=false',
               queryTests = testsReverse.map(function(test) {
                  return {
                     url: test.url + queryString,
                     result: test.result + queryString
                  };
               });

            runTestsReverse(queryTests);
         });

         it('ignores hash in the url', function() {
            var hashString = '#userid=00000111',
               hashTests = testsReverse.map(function(test) {
                  return {
                     url: test.url + hashString,
                     result: test.result + hashString
                  };
               });

            runTestsReverse(hashTests);
         });

         it('ignores query and hash in the url if both are present', function() {
            var combinedString = '?paramA=true&paramB=false#userid=00000111',
               combinedTests = testsReverse.map(function(test) {
                  return {
                     url: test.url + combinedString,
                     result: test.result + combinedString
                  };
               });

            runTestsReverse(combinedTests);
         });

         it('returns urls as is if routes.json did not load', function() {
            UrlRewriter._prepareRoutes(null);

            var resEqUrl = testsReverse.map(function(test) {
               return {
                  url: test.url,
                  result: test.url
               };
            });

            runTestsReverse(resEqUrl);
         });
      });
   });
});
