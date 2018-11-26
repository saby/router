/// <amd-module name="Router/UrlRewriter" />
"use strict";

import * as json from 'json!router';

const httpRE = /^http[s]?:\/\//;
const startSlash = /^\//;
const finishSlash = /\/$/;
function getPath(url) {
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

const routeTree = {
   value: null,
   tree: {}
};
const rootRoute = json.hasOwnProperty('/') ? json['/'] : null;
delete json['/'];

for (let routeName in json) {
   if (json.hasOwnProperty(routeName)) {
      const routeDest = json[routeName];

      routeName = getPath(routeName);

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

function get(url) {
   if (url === '/') {
      return rootRoute;
   }

   const urlPatched = getPath(url);
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
         found = curTreePoint[urlPart].value;
         foundIndex = i;
      }

      curTreePoint = curTreePoint[urlPart].tree;
   }

   if (found) {
      const prefix = urlArr.slice(0, foundIndex + 1).join('/');
      const result = url.replace(prefix, found);
      return result;
   } else {
      return url;
   }
}

const rewriter = {
   get: get
};

export default rewriter;