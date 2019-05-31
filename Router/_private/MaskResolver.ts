/// <amd-module name="Router/_private/MaskResolver" />

// @ts-ignore
import { IoC } from 'Env/Env';

import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';

interface IParam {
    name: string;
    value: any;
    urlValue?: string;
}

interface IMatchPosition {
    prefixEnd: number;
    suffixStart: number;
    name?: string;
}

interface ISplitPath {
    path: string;
    misc: string;
}

/*
 * @function Router/_private/MaskResolver#calculateUrlParams
 * Extract values from the current URL based on the specified mask
 * @param {String} mask mask with parameter placeholders
 * @param {String} [url] URL to extract values from (current URL will be used by default)
 * @returns {HashMap<string>} the key-value store of extracted parameters
 */
/**
 * @function Router/_private/MaskResolver#calculateUrlParams
 * Извлекает значения из текущего адреса по заданной маске
 * @param {String} mask параметризованная маска
 * @param {String} [url] адрес, из которого будут извлекаться значения. По умолчанию используется текущий URL
 * @returns {HashMap<string>} объект, в котором ключи - названия параметров, а значения - значения параметров
 */
export function calculateUrlParams(mask: string, url?: string): HashMap<any> {
    _validateMask(mask);

    const params = _calculateParams(mask, {}, url);
    const urlParams = _getUrlParams(params);
    return _mapParams(urlParams, _decodeParam);
}

/**
 * @function Router/_private/MaskResolver#calculateCfgParams
 * @private
 */
export function calculateCfgParams(mask: string, cfg: any): HashMap<any> {
    _validateMask(mask);

    const params = _calculateParams(mask, cfg);
    return _getCfgParams(params);
}

/*
 * @function Router/_private/MaskResolver#calculateHref
 * Calculates a new URL based on the current URL, specified mask
 * and the hash map of parameters to fill the mask
 * @param {String} mask mask with parameter placeholders
 * @param {HashMap<string>} cfg key-value store with specified parameters
 * @returns {String} the new calculated URL
 */
/**
 * @function Router/_private/MaskResolver#calculateHref
 * Вычисляет новый URL-адрес, применяя к текущему маску и значения
 * параметров для ее заполнения
 * @param {String} mask параметризованная маска
 * @param {HashMap<string>} cfg объект со значениями параметров, используемых в маске
 * @returns {String} вычисленный адрес
 */
export function calculateHref(mask: string, cfg: any): string {
    _validateMask(mask);
    cfg = cfg.clear ? {} : cfg;
    const url = UrlRewriter.get(Data.getRelativeUrl());
    return _resolveHref(url, mask, cfg);
}

// TODO Remove this?
export function getAppNameByUrl(url: string): string {
    url = UrlRewriter.get(url);
    return _getFolderNameByUrl(url) + '/Index';
}

function _validateMask(mask: string): void {
    if (mask.indexOf('/') !== -1 && mask.indexOf('=') !== -1) {
        IoC.resolve('ILogger').error('Router.MaskResolver', `Mask "${mask}" is invalid`);
    }
}

const postfix = '/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined/undefined';
function _splitQueryAndHash(url: string): ISplitPath {
    const splitMatch = url.match(/[?#]/);
    if (splitMatch) {
        const index = splitMatch.index;
        return {
            path: url.substring(0, index).replace(/\/$/, ''),
            misc: url.slice(index)
        };
    }
    return {
        path: url.replace(/\/$/, ''),
        misc: ''
    };
}
function _calculateParams(mask: string, cfg: any, url?: string): IParam[] {
    const result: IParam[] = [];
    const fullMask = _generateFullMaskWithoutParams(mask, (param) => {
        result.push({
            name: param.name,
            value: cfg[param.name]
        });
    });

    let originUrl = url || Data.getRelativeUrl();
    const { path, misc }: ISplitPath = _splitQueryAndHash(originUrl);
    originUrl = path + postfix + misc;

    const actualUrl = UrlRewriter.get(originUrl);
    const fields = actualUrl.match(fullMask);

    if (fields) {
        // fields[0] is the full url, fields[1] is prefix and fields[fields.length - 1] is suffix
        for (let j = 2; j < fields.length - 1; j++) {
            result[j - 2].urlValue = fields[j];

            // convert 'undefined' to undefined
            if (result[j - 2].urlValue === 'undefined') {
                result[j - 2].urlValue = undefined;
            }
        }
    }
    return result;
}

function _generateFullMaskWithoutParams(mask: string, matchedParamCb?: (param: IMatchPosition) => void): string {
    let fullMask = _generateFullMask(mask);

    const paramIndexes: IMatchPosition[] = [];
    _matchParams(fullMask, (param) => {
        paramIndexes.push({
            prefixEnd: param.prefixEnd,
            suffixStart: param.suffixStart
        });
        if (matchedParamCb) {
            matchedParamCb(param);
        }
    });

    for (let i = paramIndexes.length - 1; i >= 0; i--) {
        fullMask =
            fullMask.slice(0, paramIndexes[i].prefixEnd) + '([^\\/?&#]+)' + fullMask.slice(paramIndexes[i].suffixStart);
    }
    return fullMask;
}

function _generateFullMask(mask: string): string {
    let fullMask = mask;

    if (fullMask.indexOf('/') !== -1) {
        if (fullMask[0] === '/') {
            fullMask = '([/]|.*?\\.html/)' + fullMask.slice(1);
        } else {
            fullMask = '(.*?/)' + fullMask;
        }
    } else if (fullMask.indexOf('=') !== -1) {
        fullMask = '(.*?\\?|.*?&)' + fullMask;
    } else {
        fullMask = '(.*?/)' + fullMask;
    }

    if (fullMask.indexOf('=') !== -1) {
        fullMask = fullMask + '(#.*|&.+)?';
    } else {
        fullMask = fullMask + '(#.*|/.*|\\?.+)?';
    }

    return fullMask;
}

function _matchParams(mask: string, cb: (param: IMatchPosition) => void): void {
    const re = /:(\w+)/g;
    let paramMatched = re.exec(mask);
    while (paramMatched) {
        cb({
            prefixEnd: paramMatched.index,
            suffixStart: paramMatched.index + paramMatched[0].length,
            name: paramMatched[1]
        });
        paramMatched = re.exec(mask);
    }
}

function _getUrlParams(params: IParam[]): HashMap<any> {
    const res: HashMap<any> = {};
    params.forEach((param) => {
        res[param.name] = param.urlValue;
    });
    return res;
}

function _getCfgParams(params: IParam[]): HashMap<any> {
    const res: HashMap<any> = {};
    params.forEach((param) => {
        res[param.name] = param.value;
    });
    return res;
}

function _resolveHref(href: string, mask: string, cfg: any): string {
    const params = _calculateParams(mask, cfg);
    const cfgParams = _getCfgParams(params);
    const urlParams = _getUrlParams(params);

    const toFind = _resolveMask(mask, urlParams);
    const toReplace = _resolveMask(mask, _mapParams(cfgParams, _encodeParam));

    let result = href;
    if (toReplace && toReplace[0] === '/') {
        result = toReplace;
    } else if (toFind) {
        if (toReplace) {
            result = href.replace(toFind, toReplace);
        } else {
            if (href.indexOf('/' + toFind) !== -1) {
                result = href.replace('/' + toFind, '');
            } else if (href.indexOf('?' + toFind) !== -1) {
                const hasOtherParams = href.indexOf('?' + toFind + '&') !== -1;
                if (hasOtherParams) {
                    result = href.replace('?' + toFind + '&', '?');
                } else {
                    result = href.replace('?' + toFind, '');
                }
            } else if (href.indexOf('&' + toFind) !== -1) {
                result = href.replace('&' + toFind, '');
            }
        }
    } else if (toReplace) {
        const qIndex = href.indexOf('?');
        if (toReplace.indexOf('=') !== -1) {
            if (qIndex !== -1) {
                result += '&' + toReplace;
            } else {
                result += '?' + toReplace;
            }
        } else {
            if (qIndex !== -1) {
                result = _appendSlash(href.slice(0, qIndex)) + toReplace + href.slice(qIndex);
            } else {
                result = _appendSlash(href) + toReplace;
            }
        }
    }
    return result;
}

function _resolveMask(mask: string, params: HashMap<any>): string {
    let paramCount = 0;
    let resolvedCount = 0;

    _matchParams(mask, (param) => {
        paramCount++;
        if (params[param.name] !== undefined) {
            resolvedCount++;
            mask = mask.replace(':' + param.name, params[param.name]);
        }
    });

    let result = '';
    if (resolvedCount === paramCount) {
        result = mask;
    }
    return result;
}

// Adds a forward slash to the end of href if it doesn't end
// with a slash already
function _appendSlash(href: string): string {
    if (href[href.length - 1] === '/') {
        return href;
    } else {
        return href + '/';
    }
}

function _getFolderNameByUrl(url: string): string {
    let folderName = url || '';

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

    return folderName;
}

function _mapParams(obj: HashMap<string>, cb: (val: any) => string): HashMap<string> {
    const result = {};
    for (const i in obj) {
        if (obj.hasOwnProperty(i)) {
            result[i] = cb(obj[i]);
        }
    }
    return result;
}

function _encodeParam(param: any): string {
    const type = typeof param;
    let result: string = param;
    if (type !== 'undefined') {
        if (type !== 'string') {
            result = JSON.stringify(result);
        }
        result = encodeURIComponent(result);
    }
    return result;
}

function _decodeParam(param: string): string {
    let result = param;
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
