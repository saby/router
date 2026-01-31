import { getStore, ICookieOptions, IHttpResponse } from 'Application/Env';
import { IServerRoutingRequest } from 'Router/ServerRouting';
import { IRenderOptions } from 'Router/_Builder/_Bootstrap/Interface';
import { getAdaptiveModeForLoaders } from 'UI/Adaptive';

export const fakeRenderOptions: IRenderOptions = {
    appRoot: '/',
    wsRoot: 'WS.Core',
    resourceRoot: '/',
    staticDomains: [],
    servicesPath: '/',
    pageConfig: {},
    Router: {},
    adaptiveMode: getAdaptiveModeForLoaders(),
};

interface IFakeRequestData {
    path: string;
    originalUrl?: string;
    url?: string;
    baseUrl?: string;
}

export function createFakeRequest(req: IFakeRequestData): IServerRoutingRequest {
    return {
        path: req.path,
        originalUrl: req.originalUrl || req.path,
        url: req.url || req.originalUrl || '',
        baseUrl: req.baseUrl || '/',
        compatible: false,
        staticConfig: {},
        pageName: '',
        headers: {},
    };
}

export function createFakeResponse(streamResponse?: boolean): IHttpResponse {
    return {
        clearCookie(_: string, __?: Partial<ICookieOptions>): IHttpResponse {
            return this;
        },
        cookie(_: string, __: string, ___?: Partial<ICookieOptions>): IHttpResponse {
            return this;
        },
        header(_: string, __: unknown): IHttpResponse {
            return this;
        },
        set(_: string, __: unknown): IHttpResponse {
            return this;
        },
        redirect(_: string): IHttpResponse {
            return this;
        },
        send(_: string): IHttpResponse {
            return this;
        },
        status(_: number): IHttpResponse {
            return this;
        },
        stream_response: streamResponse,
    };
}

export function clearResponseWrapper() {
    getStore<Record<string, unknown>>('IRouterResponse').set('instance', undefined);
    getStore<Record<string, unknown>>('IPageRenderer').set('instance', undefined);
}
