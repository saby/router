/// <amd-module name="Router/UrlRewriter" />

const httpRE = /^http[s]?:\/\//;
const startSlash = /^\//;
const finishSlash = /\/$/;

// tree of paths
let routeTree: any;
// main route
let rootRoute: string;

// @ts-ignore
import replacementRoutes = require('router');
_prepareRoutes(replacementRoutes || {});

// get url using rewriting by rules from router.json
export function get(url: string): string {
   if (url === '/' && rootRoute) {
      return rootRoute;
   }
   if (routeTree) {
      const urlPatched = _getPath(url);
      const urlArr = urlPatched.split('/');

      let curTreePoint = routeTree.tree;
      let found = null;
      let foundIndex = null;

      for (let i = 0; i < urlArr.length; i++) {
         const urlPart = urlArr[i];

         if (!curTreePoint[urlPart]) {
            break;
         }

         if (curTreePoint[urlPart].value) {
            // it's found path what can be used for rewriting
            // but we must continue process of finding most long matching path
            found = curTreePoint[urlPart].value;
            foundIndex = i;
         }

         curTreePoint = curTreePoint[urlPart].tree;
      }

      if (found) {
         const prefix = urlArr.slice(0, foundIndex + 1).join('/');
         const result = url.replace(prefix, found);
         return result;
      }
   }
   return url;
}

// get path by url and normalize it
function _getPath(url: string): string {
   url = url.replace(httpRE, '');
   const qIndex = url.indexOf('?');
   const pIndex = url.indexOf('#');
   if (qIndex !== -1) {
      url = url.slice(0, qIndex);
   }
   if (pIndex !== -1) {
      url = url.slice(0, pIndex);
   }
   url = url.replace(startSlash, '').replace(finishSlash, '');
   return url;
}

// prepare data structure for quick access to it
// exported for unit tests
export function _prepareRoutes(json: any): void {
   routeTree = {
      value: null,
      tree: {}
   };
   rootRoute = null;

   if (!json) {
      return;
   }

   if (json.hasOwnProperty('/')) {
      rootRoute = '/' + _getPath(json['/']);
   }

   for (let routeName in json) {
      if (json.hasOwnProperty(routeName)) {
         if (routeName === '/') {
            continue;
         }

         const routeDest = json[routeName];

         routeName = _getPath(routeName);

         const routeNameArr = routeName.split('/');

         let curTreePoint = routeTree.tree;

         for (let i = 0; i < routeNameArr.length; i++) {
            const routeNamePart = routeNameArr[i];

            if (!curTreePoint.hasOwnProperty(routeNamePart)) {
               curTreePoint[routeNamePart] = {
                  value: null,
                  tree: {}
               };
            }

            if (routeNameArr.length - 1 === i) {
               curTreePoint[routeNamePart].value = routeDest;
            }

            curTreePoint = curTreePoint[routeNamePart].tree;
         }
      }
   }
}
