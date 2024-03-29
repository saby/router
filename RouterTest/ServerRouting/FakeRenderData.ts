import { IServerRoutingRequest } from 'Router/ServerRouting';
import { IRenderOptions } from 'Router/_Builder/_Bootstrap/Interface';

export const fakeRenderOptions: IRenderOptions = {
    appRoot: '/',
    wsRoot: 'WS.Core',
    resourceRoot: '/',
    staticDomains: [],
    servicesPath: '/',
    pageConfig: {},
    Router: {},
};

interface IFakeRequestData {
    path: string;
    originalUrl?: string;
    url?: string;
    baseUrl?: string;
}

export function createFakeRequest(
    req: IFakeRequestData
): IServerRoutingRequest {
    return {
        path: req.path,
        originalUrl: req.originalUrl || req.path,
        url: req.url || req.originalUrl,
        baseUrl: req.baseUrl || '/',
        compatible: false,
        staticConfig: {},
        pageName: '',
        headers: {},
    };
}
