/**
 * Методы разбивки/сборки частей url адреса
 */

/**
 * Интерфейс, для частей url адреса.
 * Напр., url вида /path/?query=value#fragment будет разбит на
 * path: /path
 * query: ?query=value
 * fragment: #fragment
 */
export interface IUrlParts {
    path?: string;
    query?: string;
    fragment?: string;
}

/**
 * Класс разбивает url адрес на составные части и собирает его обратно в url адрес
 */
export class UrlParts {
    private urlParts: IUrlParts;
    private hasTrailingSlash: boolean = false;
    constructor(url: string) {
        this.urlParts = this.parseUrl(url);
    }

    /**
     * Разбивает url адрес на составные части path, query и fragment
     * @param url
     */
    private parseUrl(url: string): IUrlParts {
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
        this.hasTrailingSlash = path && path !== '/' ? !!(path.match(/\/$/)) : false;

        return {
            path: path.replace(/\/$/, ''),
            query,
            fragment
        };
    }

    getPath(): string {
        return this.urlParts.path;
    }

    getQuery(): string {
        return this.urlParts.query;
    }

    clearQuery(): void {
        this.urlParts.query = '';
    }

    getFragment(): string {
        return this.urlParts.fragment;
    }

    /**
     * Собирает из частей path, query и fragment целый url адрес
     */
    join(newUrlParts: IUrlParts): string {
        let path: string = this.urlParts.path;
        if (newUrlParts.hasOwnProperty('path')) {
            path = newUrlParts.path;
        }
        path = path.replace(/^[#/?&=]+/, '').replace(/[#/?&=]+$/, '');
        path = path.length ? ['/', path, this._getTrailingSlash(path)].join('') : '/';

        let query: string = this.urlParts.query;
        if (newUrlParts.hasOwnProperty('query')) {
            query = newUrlParts.query;
        }
        query = query.replace(/^[#/?]/, '');
        if (query.length > 0) {
            query = '?' + query;
        }

        let fragment: string = this.urlParts.fragment;
        if (newUrlParts.hasOwnProperty('fragment')) {
            fragment = newUrlParts.fragment;
        }
        fragment = fragment.replace(/^[#/?]/, '');
        if (fragment.length > 0) {
            fragment = '#' + fragment;
        }
        return [path, query, fragment].join('');
    }

    private _getTrailingSlash(path: string): string {
        if (/\.[^.]+$/.exec(path)) {
            return '';
        }
        return this.hasTrailingSlash ? '/' : '';
    }
}
