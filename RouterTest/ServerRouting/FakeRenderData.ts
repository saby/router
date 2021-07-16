import { IServerRoutingRequest } from 'Router/ServerRouting';
import { IRenderOptions } from 'Router/_Builder/_Bootstrap/Interface';


export const fakeRenderOptions: IRenderOptions = {
    appRoot: '/',
    wsRoot: 'WS.Core',
    resourceRoot: '/',
    staticDomains: [],
    servicesPath: '/',
    pageConfig: {}
};

export function createFakeRequest(path: string): IServerRoutingRequest {
    return {
       path,
       compatible: false,
       staticConfig: {},
       pageName: ''
    };
}
