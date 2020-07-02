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

    getPath(): string {
        return this.urlParts.path;
    }

    getQuery(): string {
        return this.urlParts.query;
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
        path = path.replace(/[#/?&=]+$/, '') + '/';

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
}
