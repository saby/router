/// <amd-module name="Router/_private/MaskResolver" />

/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @name Router/_private/MaskResolver
 * @author Мустафин Л.И.
 */

import { IoC } from 'Env/Env';
import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';
import {IParam, UrlModifier} from './UrlModifier';
import PathModifier from './PathModifier';
import QueryModifier from './QueryModifier';

interface ISplitPath {
    path: string;
    query: string;
    fragment: string;
}

interface IModifier {
    path?: PathModifier;
    query?: QueryModifier;
    fragment?: string;
}

// TODO Remove this? используется в Route.Controller
export function getAppNameByUrl(url: string): string {
    let folderName: string = UrlRewriter.get(url) || '';

    // Folder name for url '/sign_in?return=mainpage' should be 'sign_in'
    if (folderName.indexOf('?') !== -1) {
        folderName = folderName.replace(/\?.*/, '');
    }

    // Folder name for url '/news#group=testGroup' should be 'news'
    if (folderName.indexOf('#') !== -1) {
        folderName = folderName.replace(/#.*/, '');
    }

    // Folder name for '/Tasks/onMe' is 'Tasks', but folder name for
    // 'tasks.html' is 'tasks.html'
    if (folderName.indexOf('/') !== -1) {
        folderName = folderName.split('/')[1];
    }

    return folderName + '/Index';
}

export function calculateUrlParams(mask: string, url?: string): Record<string, unknown> {
    const resolver: MaskResolver = new MaskResolver(mask, {}, url);
    return resolver.getUrlParams();
}

// export function calculateCfgParams(mask: string, cfg: Record<string, unknown>): Record<string, unknown> {
//     const resolver: MaskResolver = new MaskResolver(mask, cfg);
//     return resolver.getCfgParams();
// }

export function calculateHref(mask: string, cfg: Record<string, unknown>): string {
    const resolver: MaskResolver = new MaskResolver(mask, cfg);
    return resolver.rewrite();
}

function _decodeParam(param: string): string {
    let result: string = param;
    if (typeof result !== 'undefined') {
        try {
            result = decodeURIComponent(result);
        } catch (e) {
            // If decoder throws an error, that means that the original
            // URL was malformed. If the user enters an invalid URL,
            // ignore the decoding (because it can't be decoded by the
            // browser) and return the string as is.
        }
    }
    return result;
}

class MaskResolver {
    private readonly mask: string;
    private readonly url: string;
    private readonly actualCfg: Record<string, unknown>;
    private readonly urlParts: ISplitPath;
    private readonly modifier: IModifier;
    constructor(mask: string, cfg: Record<string, unknown>, url?: string) {
        this.mask = mask;
        this._validateMask();
        this.url = url || UrlRewriter.get(Data.getRelativeUrl());
        this.actualCfg = cfg.clear ? {} : cfg;

        // когда нужно заменить url переданной маской
        if (cfg.replace) {
            this.urlParts = {path: '', query: '', fragment: ''};
        } else {
            this.urlParts = this._splitUrlPath();
        }

        // определим тип маски
        this.modifier = this._getModifier();
    }

    private _validateMask(): void {
        if (this.mask.indexOf('/') < 0 && this.mask.indexOf('=') < 0) {
            IoC.resolve('ILogger').error('Router.MaskResolver', `Mask "${this.mask}" is invalid`);
        }
    }

    private _splitUrlPath(): ISplitPath {
        const url: string = this.url;
        const queryPos: number = url.indexOf('?');
        const hashPos: number = url.indexOf('#');
        if (queryPos >= 0 && hashPos >= 0) {
            return {
                path: url.substring(0, queryPos).replace(/\/$/, ''),
                query: url.substring(queryPos, hashPos),
                fragment: url.substring(hashPos, url.length)
            };
        }
        if (queryPos >= 0) {
            return {
                path: url.substring(0, queryPos).replace(/\/$/, ''),
                query: url.substring(queryPos, url.length),
                fragment: ''
            };
        }
        if (hashPos >= 0) {
            return {
                path: url.substring(0, hashPos).replace(/\/$/, ''),
                query: '',
                fragment: url.substring(hashPos, url.length)
            };
        }
        return {
            path: url.replace(/\/$/, ''),
            query: '',
            fragment: ''
        };
    }

    private _getModifier(): IModifier {
        // par1/:val1
        if (/[^\/?&#]+\/:[^\/?&#]+/.test(this.mask)) {
            return {path: new PathModifier(this.mask, this.urlParts.path)};
        }
        // par1=:val1
        if (/[^\/?&#]+=:[^\/?&#]+/.test(this.mask)) {
            return {query: new QueryModifier(this.mask, this.urlParts.query)};
        }
        return undefined;
    }

    private calculateParams(): IParam[] {
        if (this.modifier) {
            const modifier: UrlModifier = this.modifier.path || this.modifier.query;
            return modifier.calculateParams(this.actualCfg);
        }
        return [];
    }

    getUrlParams(): Record<string, string> {
        const urlParams: Record<string, unknown> = {};
        this.calculateParams().forEach((param) => {
            urlParams[param.name] = param.urlValue;
        });
        return this._mapParams(urlParams, _decodeParam);
    }

    getCfgParams(): Record<string, unknown> {
        const cfgParams: Record<string, unknown> = {};
        this.calculateParams().forEach((param) => {
            cfgParams[param.name] = param.value;
        });
        return cfgParams;
    }

    private _mapParams(obj: Record<string, unknown>, cb: (val: unknown) => string): Record<string, string> {
        const result: Record<string, string> = {};
        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                result[i] = cb(obj[i]);
            }
        }
        return result;
    }

    rewrite(): string {
        if (!this.modifier) {
            return this.url;
        }
        if (this.modifier.path) {
            this.urlParts.path = this.modifier.path.rewrite(this.actualCfg);
        }
        if (this.modifier.query) {
            this.urlParts.query = this.modifier.query.rewrite(this.actualCfg);
        }
        // this.urlParts.fragment = this.modifier.fragment?.rewrite(this.actualCfg);
        return this._joinUrlParts();
    }

    private _joinUrlParts(): string {
        const urlParts: ISplitPath = this.urlParts;
        const path = urlParts.path + '/';
        let query: string = urlParts.query === '?' ? '' : urlParts.query;
        if (query.length > 0) {
            query = query.indexOf('?') < 0 ? '?' + query : query;
        }
        let fragment: string = urlParts.fragment === '#' ? '' : urlParts.fragment;
        if (fragment.length > 0) {
            fragment = fragment.indexOf('#') < 0 ? '#' + fragment : fragment;
        }
        return [path, query, fragment].join('');
    }
}
