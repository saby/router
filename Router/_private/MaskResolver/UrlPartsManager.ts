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
    path: string;
    query: string;
    fragment: string;
}

/**
 * Класс разбивает url адрес на составные части и собирает его обратно в url адрес
 */
export class UrlPartsManager {
    /**
     * Разбивает url адрес на составные части path, query и fragment
     * @param url
     */
    static getUrlParts(url: string): IUrlParts {
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

    /**
     * Собирает из частей path, query и fragment целый url адрес
     * @param urlParts
     */
    static joinUrlParts(urlParts: IUrlParts): string {
        const path = urlParts.path + '/';
        let query: string = urlParts.query.replace(/^[#/?]/, '');
        if (query.length > 0) {
            query = '?' + query;
        }
        let fragment: string = urlParts.fragment.replace(/^[#/?]/, '');
        if (fragment.length > 0) {
            fragment = '#' + fragment;
        }
        return [path, query, fragment].join('');
    }
}
