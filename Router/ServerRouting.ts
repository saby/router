/// <amd-module name="Router/ServerRouting" />

// TODO Move this file to Presentation Service?
import { MaskResolver } from 'Router/router';

/**
 * Роутинг для серверного рендеринга
 */
interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
}

interface IServerRoutingResponse {
    render: (template: string, appOptions: Record<string, unknown>) => void;
}

let _baseTemplate: string = 'wml!Controls/Application/Route';

export function getAppName(request: IServerRoutingRequest): string {
    return MaskResolver.getAppNameByUrl(request.path);
}

export function renderApp(request: IServerRoutingRequest, response: IServerRoutingResponse, appName: string): void {
    request.compatible = false;
    response.render(_baseTemplate, {
        application: appName
    });
}

export function setBaseTemplate(newBaseTemplate: string): void {
    _baseTemplate = newBaseTemplate;
}
