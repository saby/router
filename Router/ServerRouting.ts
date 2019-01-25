/// <amd-module name="Router/ServerRouting" />

import RouterHelper from 'Router/Helper';
import UrlRewriter from 'Router/UrlRewriter';

// Always load router.json on the server, presentation service
// runs after the build was completed, so router.json file is
// already built. It has to be loaded before handling the first
// request, so it has to be a dependency of Router/ServerRouting
// @ts-ignore
import replacementRoutes = require('router');
UrlRewriter._prepare(replacementRoutes || {});

let baseTemplate = 'wml!Controls/Application/Route';

function getAppName(request) {
   return RouterHelper.getAppNameByUrl(request.path);
}

function renderApp(request, response, appName) {
   request.compatible = false;
   response.render(baseTemplate, {
      application: appName
   });
}

function setBaseTemplate(newBaseTemplate) {
   baseTemplate = newBaseTemplate
}

export = {
   getAppName,
   setBaseTemplate,
   renderApp
};
