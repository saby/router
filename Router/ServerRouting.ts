/// <amd-module name="Router/ServerRouting" />

// TODO Move this file to Presentation Service?

import { getAppNameByUrl } from 'Router/MaskResolver';

export function getAppName(request): string {
   return getAppNameByUrl(request.path);
}

export function renderApp(request, response, appName): void {
   request.compatible = false;
   response.render('wml!Controls/Application/Route', {
      application: appName
   });
}