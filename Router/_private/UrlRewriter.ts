/// <amd-module name="Router/_private/UrlRewriter" />

/**
 * Набор методов для работы с router.json, в котором можно задать соответствие
 * между текущим путем и его короткой записью - "красивым" URL
 * @module
 * @author Санников К.А.
 */

const httpRE: RegExp = /^http[s]?:\/\//;
const multiSlash: RegExp = /\/{2,}/g;
const startSlash: RegExp = /^\//;
const finishSlash: RegExp = /\/$/;

type RouteEntriesArray = string[][];

interface IRouteTreeNode {
    value?: string;
    tree: Record<string, IRouteTreeNode>;
}

interface IRouteTree extends IRouteTreeNode {
    rootRoute: string;
}

interface ISplitPath {
    path: string;
    misc: string;
}

let routeTree: IRouteTree = null;
let reverseRouteTree: IRouteTree = null;

import replacementRoutes = require('router');
_prepareRoutes(replacementRoutes as unknown as Record<string, string> || {});

/*
 * @function
 * Rewrites the given URL by replacing its prefix based on the configuration
 * in the router.json configuration file
 * @param {String} originalUrl URL to rewrite
 * @returns {String} rewritten URL
 */
/**
 * @function
 * Модифицирует переданный URL, заменяя его префикс на основе конфигурации, указанной
 * в файле router.json
 * @param {String} originalUrl URL для модификации
 * @returns {String} модифицированный URL
 */
export function get(originalUrl: string): string {
    return getBestMatchFromRouteTree(originalUrl, routeTree);
}

/*
 * @function
 * De-rewrites the given URL by turning the replaced prefix back into its
 * original form, based on the router.json configuration
 * @param {String} rewrittenUrl url to de-rewrite
 * @returns {String} original url
 */
/**
 * @function
 * Отменяет модификацию URL-адреса, возвращая его в исходный вид,
 * заменяя префикс на исходный, на основе конфигурации в файле
 * router.json
 * @param {String} rewrittenUrl URL для восстановления
 * @returns {String} исходный URL
 */
export function getReverse(rewrittenUrl: string): string {
    return getBestMatchFromRouteTree(rewrittenUrl, reverseRouteTree);
}

function getBestMatchFromRouteTree(url: string, rootNode: IRouteTree): string {
    const { path, misc }: ISplitPath = _splitQueryAndHash(url);

    if (path === '/' && rootNode && rootNode.rootRoute) {
        return rootNode.rootRoute + misc;
    }
    if (rootNode) {
        const urlParts: string[] = _getPath(path).split('/');

        let curTreeNode: Record<string, IRouteTreeNode> = rootNode.tree;
        let bestMatching: string | null = null;
        let bestMatchingIndex: number = -1;
        const setBestMatching = (value, index) => {
            if (value) {
                bestMatching = value;
                bestMatchingIndex = index;
            }
        };

        for (let i = 0; i < urlParts.length; i++) {
            const urlPart: string = urlParts[i];

            if (!curTreeNode[urlPart]) {
                setBestMatching(_getRegExpUrlPart(urlPart, curTreeNode), i);
                break;
            }

            setBestMatching(curTreeNode[urlPart].value, i);
            curTreeNode = curTreeNode[urlPart].tree;
        }

        if (bestMatching) {
            const prefix: string = urlParts.slice(0, bestMatchingIndex + 1).join('/');
            const result: string = path.replace(prefix, bestMatching).replace(multiSlash, '/');
            return result + misc;
        }
    }
    return path + misc;
}

/**
 * Обработка ключа в router.json вида "/regex:<validRegex>"
 * Т.е. если у текущей ноды дерева router.json есть ключ с регуляркой, то если текущий кусок url-адреса
 * подходит под эту регулярку, то возвращаем значение этой ноды
 *
 * Напр. есть router.json вида:
 * {
 *    "/": "Module",
 *    "/regex:^([0-9]{5})$": "Module/$1"
 * }
 * Тогда url вида "/12345" будет заменен на "Module/12345". Это означает, что оба случая из этого router.json
 * будут обработаны модулем Module/Index
 *
 * Соотв. в Router.router:Route можно использовать маску вида "Module/:id", как
 * <Router.router:Route mask="Module/:id">
 *     <div>{{ content.id }}</div>
 * </Router.router:Route>
 *
 * @param urlPart
 * @param curTreeNode
 */
function _getRegExpUrlPart(urlPart: string, curTreeNode: Record<string, IRouteTreeNode>): string {
    let result: string = null;
    Object.keys(curTreeNode).forEach((key) => {
        if (key.indexOf('regex:') !== 0) {
            return;
        }
        const regexp = new RegExp(key.replace('regex:', ''));
        if (!regexp.test(urlPart)) {
            return;
        }
        const value = curTreeNode[key].value;
        if (!value) {
            return;
        }
        result = urlPart.replace(regexp, value);
    });
    return result;
}

function _splitQueryAndHash(url: string): ISplitPath {
    const splitMatch: RegExpMatchArray = url.match(/[?#]/);
    if (splitMatch) {
        const index: number = splitMatch.index;
        return {
            path: url.substring(0, index),
            misc: url.slice(index)
        };
    }
    return {
        path: url,
        misc: ''
    };
}

// get path by url and normalize it
function _getPath(url: string): string {
    let result: string = url.replace(httpRE, '');
    const qIndex: number = result.indexOf('?');
    const pIndex: number = result.indexOf('#');
    if (qIndex !== -1) {
        result = result.slice(0, qIndex);
    }
    if (pIndex !== -1) {
        result = result.slice(0, pIndex);
    }
    result = result.replace(startSlash, '').replace(finishSlash, '');
    return result;
}

/*
 * Turns the router.json config file into the routing tree. Exported
 * for tests
 * @param {Object} json rewriter config file
 * @hidden
 */
/**
 * Превращает конфигурационный файл router.json в дерево роутинга.
 * Экспортируется для тестов
 * @param {Object} json объект с конфигурацией замен адресов
 * @hidden
 */
export function _prepareRoutes(json: Record<string, string>): void {
    const entries: RouteEntriesArray = getEntries(json);
    routeTree = buildRouteTree(entries);
    reverseRouteTree = buildRouteTree(reverseEntries(entries));
}

function buildRouteTree(entries: RouteEntriesArray): IRouteTree {
    const result: IRouteTree = {
        tree: {},
        rootRoute: null
    };

    entries.forEach((entry) => {
        const routeName: string = entry[0];
        const routeDest: string = entry[1];

        if (routeName === '/') {
            result.rootRoute = '/' + _getPath(routeDest);
            return;
        }

        const routeNameParts: string[] = _getPath(routeName).split('/');

        let curTreeNode: Record<string, IRouteTreeNode> = result.tree;
        routeNameParts.forEach((part, i) => {
            if (!curTreeNode.hasOwnProperty(part)) {
                curTreeNode[part] = {
                    value: null,
                    tree: {}
                };
            }
            if (i === routeNameParts.length - 1) {
                if (!curTreeNode[part].value || curTreeNode[part].value.length > routeDest.length) {
                    curTreeNode[part].value = routeDest;
                }
            }
            curTreeNode = curTreeNode[part].tree;
        });
    });

    return result;
}

function getEntries(json: Record<string, string>): RouteEntriesArray {
    if (!json) {
        return [];
    }

    const ownProps: string[] = Object.keys(json);
    let i: number = ownProps.length;
    const result: RouteEntriesArray = new Array(i);

    while (i--) {
        result[i] = [ownProps[i], json[ownProps[i]]];
    }

    return result;
}

function reverseEntries(entries: RouteEntriesArray): RouteEntriesArray {
    return entries.map((entry) => [entry[1], entry[0]]);
}
