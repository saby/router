/// <amd-module name="Router/UrlRewriter" />

const httpRE = /^http[s]?:\/\//;
const multiSlash = /\/{2,}/g;
const startSlash = /^\//;
const finishSlash = /\/$/;

type RouteEntriesArray = string[][];

interface IRouteTreeNode {
   value?: string;
   tree: HashMap<IRouteTreeNode>;
}

interface IRouteTree extends IRouteTreeNode {
   rootRoute: string;
}

let routeTree: IRouteTree = null;
let reverseRouteTree: IRouteTree = null;

// @ts-ignore
import replacementRoutes = require('router');
_prepareRoutes(replacementRoutes || {});

// get url using rewriting by rules from router.json
export function get(originalUrl: string): string {
   return getBestMatchFromRouteTree(originalUrl, routeTree);
}

export function getReverse(rewrittenUrl: string): string {
   return getBestMatchFromRouteTree(rewrittenUrl, reverseRouteTree);
}

function getBestMatchFromRouteTree(url: string, rootNode: IRouteTree): string {
   const { path, misc } = _splitQueryAndHash(url);

   if (path === '/' && rootNode && rootNode.rootRoute) {
      return rootNode.rootRoute + misc;
   }
   if (rootNode) {
      const urlParts = _getPath(path).split('/');

      let curTreeNode = rootNode.tree;
      let bestMatching = null;
      let bestMatchingIndex = -1;

      for (let i = 0; i < urlParts.length; i++) {
         const urlPart = urlParts[i];

         if (!curTreeNode[urlPart]) {
            break;
         }

         const nodeValue = curTreeNode[urlPart].value;
         if (nodeValue) {
            bestMatching = nodeValue;
            bestMatchingIndex = i;
         }

         curTreeNode = curTreeNode[urlPart].tree;
      }

      if (bestMatching) {
         const prefix = urlParts.slice(0, bestMatchingIndex + 1).join('/');
         const result = path.replace(prefix, bestMatching).replace(multiSlash, '/');
         return result + misc;
      }
   }
   return path + misc;
}

function _splitQueryAndHash(url: string): { path: string, misc: string } {
   const splitMatch = url.match(/[?#]/);
   if (splitMatch) {
      const index = splitMatch.index;
      return {
         path: url.substring(0, index),
         misc: url.slice(index)
      };
   }
   return {
      path: url,
      misc: ''
   };
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
   const entries = getEntries(json);
   routeTree = buildRouteTree(entries);
   reverseRouteTree = buildRouteTree(reverseEntries(entries));
}

function buildRouteTree(entries: RouteEntriesArray): IRouteTree {
   const result: IRouteTree = {
      tree: {},
      rootRoute: null
   };

   entries.forEach(entry => {
      const routeName = entry[0];
      const routeDest = entry[1];

      if (routeName === '/') {
         result.rootRoute = '/' + _getPath(routeDest);
         return;
      }

      const routeNameParts = _getPath(routeName).split('/');

      let curTreeNode = result.tree;
      routeNameParts.forEach((part, i) => {
         if (!curTreeNode.hasOwnProperty(part)) {
            curTreeNode[part] = {
               value: null,
               tree: {}
            };
         }
         if (i === routeNameParts.length - 1) {
            if (!curTreeNode[part].value || curTreeNode[part].value.length > routeDest.length) {
               curTreeNode[part].value = routeDest;
            }
         }
         curTreeNode = curTreeNode[part].tree;
      });
   });

   return result;
}

function getEntries(json: any): RouteEntriesArray {
   if (!json) {
      return [];
   }

   const ownProps = Object.keys(json);
   let i = ownProps.length;
   const result = new Array(i);

   while (i--) {
      result[i] = [ownProps[i], json[ownProps[i]]];
   }

   return result;
}

function reverseEntries(entries: RouteEntriesArray): RouteEntriesArray {
   return entries.map(entry => [entry[1], entry[0]]);
}
