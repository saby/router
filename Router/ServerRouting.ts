/// <amd-module name="Router/ServerRouting" />

import RouterHelper from 'Router/Helper';

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
