/// <amd-module name="Router/ServerRouting" />
// @ts-ignore
import getUrl = require('Transport/URL/getUrl');
// @ts-ignore
import { Deferred } from 'Core/Entity';

import RouterHelper from 'Router/Helper';

function _prepareRequest(request) {
   request.compatible = false;
   if (!process.domain) {
      process.domain = {
         enter: () => { },
         exit: () => { }
      };
   }
   process.domain.req = request;
}

function _finalizeResponse(response, text: string) {
   response.writeHead(200, { 'Content-Type': 'text/html' });
   response.end(text);
}

function _writeResponse(response, rendered) {
   if (rendered instanceof Deferred) {
      rendered.addCallback(html => _finalizeResponse(response, html));
   } else {
      _finalizeResponse(response, rendered);
   }
}

function _renderApplication(request, response, application: string, appOpts: any) {
   const rootTpl = require('wml!Controls/Application/Route');

   // set the appropriate request fields
   _prepareRequest(request);

   // render the application inside of Controls/Application/Route
   const renderResult = rootTpl({
      // default options
      lite: true,
      wsRoot: '/WS.Core/',
      resourceRoot: '/',

      // default options can be overridden from outside
      // @ts-ignore
      ...appOpts,

      application
   });

   _writeResponse(response, renderResult);
}

function routeRequest(request, response, options): boolean {
   const appName = RouterHelper.getAppNameByUrl(getUrl());

   try {
      // node.js require is synchronous and throws an exception if
      // the module does not exist
      require(appName);
   } catch (e) {
      // module was not found, start the old routing process
      return false;
   }

   // if the module was found, render the application itself
   _renderApplication(request, response, appName, options);

   return true;
}

export = routeRequest;