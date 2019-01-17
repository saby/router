/// <amd-module name="Router/ServerRouting" />

// TODO Move this file to Presentation Service?

import MaskResolver from 'Router/MaskResolver';

function getAppName(request): string {
   return MaskResolver.getAppNameByUrl(request.path);
}

function renderApp(request, response, appName): void {
   request.compatible = false;
   response.render('wml!Controls/Application/Route', {
      application: appName
   });
}

export = {
   getAppName,
   renderApp
};