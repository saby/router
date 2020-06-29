/**
 *
 */

/**
 *
 */
export interface IUrlParts {
    path: string;
    query: string;
    fragment: string;
}

/**
 *
 */
export class UrlPartsManager {
    static _getUrlParts(url: string): IUrlParts {
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

    static _joinUrlParts(urlParts: IUrlParts): string {
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
