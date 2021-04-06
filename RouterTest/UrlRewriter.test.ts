import { assert } from 'chai';
import { UrlRewriter } from 'Router/router';
import json = require('RouterTest/resources/router');

interface ITestJson {
   url: string;
   result: string;
}
const tests: ITestJson[] = [
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
];
const testsReverse: ITestJson[] = [
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

function runTests(testArr: ITestJson[]) {
   testArr.forEach((test: ITestJson) => {
      assert.equal(UrlRewriter.get(test.url), test.result);
   });
}

function runTestsReverse(testArr: ITestJson[]) {
   testArr.forEach((test: ITestJson) => {
      assert.equal(UrlRewriter.getReverse(test.url), test.result);
   });
}

describe('Router/UrlRewriter', () => {
   beforeEach(() => {
      UrlRewriter._prepareRoutes(json);
   });

   it('does not throw if routes.json did not load', () => {
      assert.doesNotThrow(UrlRewriter._prepareRoutes.bind(UrlRewriter, null));
      assert.doesNotThrow(UrlRewriter._prepareRoutes.bind(UrlRewriter, undefined));
      assert.doesNotThrow(UrlRewriter._prepareRoutes.bind(UrlRewriter, {}));
   });

   describe('forward rewrite', () => {
      it('rewrites the url', () => {
         runTests(tests);
      });

      it('ignores query in the url', () => {
         const queryString: string = '?paramA=true&paramB=false';
         const queryTests: ITestJson[] = tests.map((test: ITestJson): ITestJson => {
            return {
               url: test.url + queryString,
               result: test.result + queryString
            };
         });

         runTests(queryTests);
      });

      it('ignores hash in the url', () => {
         const hashString: string = '#userid=00000111';
         const hashTests: ITestJson[] = tests.map((test: ITestJson): ITestJson => {
            return {
               url: test.url + hashString,
               result: test.result + hashString
            };
         });

         runTests(hashTests);
      });

      it('ignores query and hash in the url if both are present', () => {
         const combinedString: string = '?paramA=true&paramB=false#userid=00000111';
         const combinedTests: ITestJson[] = tests.map((test: ITestJson): ITestJson => {
            return {
               url: test.url + combinedString,
               result: test.result + combinedString
            };
         });

         runTests(combinedTests);
      });

      it('returns urls as is if routes.json did not load', () => {
         UrlRewriter._prepareRoutes(null);

         const resEqUrl: ITestJson[] = tests.map((test: ITestJson): ITestJson => {
            return {
               url: test.url,
               result: test.url
            };
         });

         runTests(resEqUrl);
      });
   });

   describe('reverse rewrite', () => {
      it('rewrites the url', () => {
         runTestsReverse(testsReverse);
      });

      it('ignores query in the url', () => {
         const queryString: string = '?paramA=true&paramB=false';
         const queryTests: ITestJson[] = testsReverse.map((test: ITestJson): ITestJson => {
            return {
               url: test.url + queryString,
               result: test.result + queryString
            };
         });

         runTestsReverse(queryTests);
      });

      it('ignores hash in the url', () => {
         const hashString: string = '#userid=00000111';
         const hashTests: ITestJson[] = testsReverse.map((test: ITestJson): ITestJson => {
            return {
               url: test.url + hashString,
               result: test.result + hashString
            };
         });

         runTestsReverse(hashTests);
      });

      it('ignores query and hash in the url if both are present', () => {
         const combinedString: string = '?paramA=true&paramB=false#userid=00000111';
         const combinedTests: ITestJson[] = testsReverse.map((test: ITestJson): ITestJson => {
            return {
               url: test.url + combinedString,
               result: test.result + combinedString
            };
         });

         runTestsReverse(combinedTests);
      });

      it('returns urls as is if routes.json did not load', () => {
         UrlRewriter._prepareRoutes(null);

         const resEqUrl: ITestJson[] = testsReverse.map((test: ITestJson): ITestJson => {
            return {
               url: test.url,
               result: test.url
            };
         });

         runTestsReverse(resEqUrl);
      });
   });
});
