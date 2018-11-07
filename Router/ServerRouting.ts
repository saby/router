/// <amd-module name="Router/ServerRouting" />
// @ts-ignore
import getUrl = require('Transport/URL/getUrl');

import RouterHelper from 'Router/Helper';

function _prepareRequest(request) {
   if (!process.domain) {
      process.domain = {
         enter: () => { },
         exit: () => { }
      };
   }
   process.domain.req = request;
}

function getAppName(request) {
   _prepareRequest(request);
   return RouterHelper.getAppNameByUrl(getUrl());
}

function renderApp(request, response, appName) {
   request.compatible = false;
   response.render('wml!Controls/Application/Route', {
      application: appName
   });
}

export = {
   getAppName,
   renderApp
};