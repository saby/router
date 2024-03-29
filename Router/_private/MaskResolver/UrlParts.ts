/**
 * Методы разбивки/сборки частей url адреса
 */

/**
 * Интерфейс, для частей url адреса.
 * Напр., url вида /path/?query=value#fragment будет разбит на
 * path: /path
 * query: ?query=value
 * fragment: #fragment
 * @private
 */
export interface IUrlParts {
    path?: string;
    query?: string;
    fragment?: string;
}

/**
 * Класс разбивает url адрес на составные части и собирает его обратно в url адрес
 * @private
 */
export class UrlParts {
    private _urlParts: IUrlParts;
    private _hasTrailingSlash: boolean = false;
    constructor(url: string) {
        this._urlParts = this._parseUrl(url);
    }

    /**
     * Разбивает url адрес на составные части path, query и fragment
     * @param url
     */
    private _parseUrl(url: string): IUrlParts {
        let queryPos: number = url.indexOf('?');
        const hashPos: number = url.indexOf('#');
        if (hashPos >= 0 && queryPos > hashPos) {
            queryPos = -1;
        }

        let path: string = url;
        let query: string = '';
        let fragment: string = '';
        if (queryPos >= 0 && hashPos >= 0) {
            path = url.substring(0, queryPos);
            query = url.substring(queryPos, hashPos);
            fragment = url.substring(hashPos, url.length);
        } else if (queryPos >= 0) {
            path = url.substring(0, queryPos);
            query = url.substring(queryPos, url.length);
        } else if (hashPos >= 0) {
            path = url.substring(0, hashPos);
            fragment = url.substring(hashPos, url.length);
        }

        // выясним, есть ли в конце path слеш
        this._hasTrailingSlash =
            path && path !== '/' ? !!path.match(/\/$/) : false;

        return {
            path: path.replace(/\/$/, ''),
            query,
            fragment,
        };
    }

    getPath(): string {
        return this._urlParts.path;
    }

    getQuery(): string {
        return this._urlParts.query;
    }

    clearQuery(): void {
        this._urlParts.query = '';
    }

    getFragment(): string {
        return this._urlParts.fragment;
    }

    clearFragment(): void {
        this._urlParts.fragment = '';
    }

    get hasTrailingSlash(): boolean {
        return this._hasTrailingSlash;
    }

    /**
     * Собирает из частей path, query и fragment целый url адрес
     * в результате в конце path должен быть "/", если:
     *  1) в текущем url в конце был "/",
     *  2) в маске в конце был слеш, но не было в текущем url
     * @param maskHasTrailingSlash признак того, что в маске в конце path был "/"
     */
    join(
        newUrlParts: IUrlParts,
        maskHasTrailingSlash: boolean = false
    ): string {
        let path: string = this._urlParts.path;
        if (newUrlParts.hasOwnProperty('path')) {
            path = newUrlParts.path;
        }
        path = path.replace(/^[#/?&=]+/, '').replace(/[#/?&=]+$/, '');
        const leadingSlash = path.startsWith('http') ? '' : '/';
        path = path.length
            ? [
                  leadingSlash,
                  path,
                  this._getTrailingSlash(path, maskHasTrailingSlash),
              ].join('')
            : '/';

        let query: string = this._urlParts.query;
        if (newUrlParts.hasOwnProperty('query')) {
            query = newUrlParts.query;
        }
        query = query.replace(/^[#/?]/, '');
        if (query.length > 0) {
            query = '?' + query;
        }

        let fragment: string = this._urlParts.fragment;
        if (newUrlParts.hasOwnProperty('fragment')) {
            fragment = newUrlParts.fragment;
        }
        fragment = fragment.replace(/^[#/?]/, '');
        if (fragment.length > 0) {
            fragment = '#' + fragment;
        }
        return [path, query, fragment].join('');
    }

    /**
     * Вернет "/", если:
     *  1) в текущем url в конце был "/",
     *  2) в маске в конце был слеш, но не было в текущем url
     * @param maskHasTrailingSlash признак того, что в маске в конце path был "/"
     */
    private _getTrailingSlash(
        path: string,
        maskHasTrailingSlash: boolean
    ): string {
        if (/\.[^.]+$/.exec(path)) {
            return '';
        }
        return this._hasTrailingSlash || maskHasTrailingSlash ? '/' : '';
    }
}
