/// <amd-module name="Router/_private/MaskResolver" />

/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @name Router/_private/MaskResolver
 * @author Черваков Д.В.
 */

import { IoC } from 'Env/Env';

import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';

interface IParam {
    name: string;
    value: unknown;
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
 * @returns {Record<string, string>} the key-value store of extracted parameters
 */
/**
 * Извлекает значения из текущего адреса по заданной маске.
 * @function
 * @name Router/_private/MaskResolver#calculateUrlParams
 * @param {String} mask Параметризованная маска.
 * @param {String} [url] Адрес, из которого будут извлекаться значения. По умолчанию используется текущий URL.
 * @returns {Record<string, string>} Объект, в котором ключи - названия параметров, а значения - значения параметров.
 */
export function calculateUrlParams(mask: string, url?: string): Record<string, unknown> {
    _validateMask(mask);

    const params = _calculateParams(mask, {}, url);
    const urlParams = _getUrlParams(params);
    return _mapParams(urlParams, _decodeParam);
}

/**
 * @function Router/_private/MaskResolver#calculateCfgParams
 * @private
 */
export function calculateCfgParams(mask: string, cfg: Record<string, unknown>): Record<string, unknown> {
    _validateMask(mask);

    const params = _calculateParams(mask, cfg);
    return _getCfgParams(params);
}

/*
 * @function Router/_private/MaskResolver#calculateHref
 * Calculates a new URL based on the current URL, specified mask
 * and the hash map of parameters to fill the mask
 * @param {String} mask mask with parameter placeholders
 * @param {Record<string, string>} cfg key-value store with specified parameters
 * @returns {String} the new calculated URL
 */
/**
 * Вычисляет новый URL-адрес, применяя к текущему маску и значения параметров для ее заполнения.
 * @function
 * @name Router/_private/MaskResolver#calculateHref
 * @param {String} mask Параметризованная маска.
 * @param {Record<string, string>} cfg Объект со значениями параметров, используемых в маске.
 * @returns {String} Вычисленный адрес.
 */
export function calculateHref(mask: string, cfg: Record<string, unknown>): string {
    _validateMask(mask);
    const actualCfg = cfg.clear ? {} : cfg;
    const url = UrlRewriter.get(Data.getRelativeUrl());
    return _resolveHref(url, mask, actualCfg);
}

// TODO Remove this?
export function getAppNameByUrl(url: string): string {
    const rewrittenUrl = UrlRewriter.get(url);
    return _getFolderNameByUrl(rewrittenUrl) + '/Index';
}

function _validateMask(mask: string): void {
    if (!_isSlashMask(mask) && !_isQueryMask(mask)) {
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

const MASK_RESULTS_OFFSET = 2;
function _calculateParams(mask: string, cfg: Record<string, unknown>, url?: string): IParam[] {
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
        for (let j = MASK_RESULTS_OFFSET; j < fields.length - 1; j++) {
            result[j - MASK_RESULTS_OFFSET].urlValue = fields[j];

            // convert 'undefined' to undefined
            if (result[j - MASK_RESULTS_OFFSET].urlValue === 'undefined') {
                result[j - MASK_RESULTS_OFFSET].urlValue = undefined;
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

    if (_isSlashMask(fullMask)) {
        if (fullMask[0] === '/') {
            fullMask = '([/]|.*?\\.html/)' + fullMask.slice(1);
        } else {
            fullMask = '(.*?/)' + fullMask;
        }
    } else if (_isQueryMask(fullMask)) {
        fullMask = '(.*?\\?|.*?&)' + fullMask;
    } else {
        fullMask = '(.*?/)' + fullMask;
    }

    if (_isQueryMask(fullMask)) {
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

function _getUrlParams(params: IParam[]): Record<string, unknown> {
    const res: Record<string, unknown> = {};
    params.forEach((param) => {
        res[param.name] = param.urlValue;
    });
    return res;
}

function _getCfgParams(params: IParam[]): Record<string, unknown> {
    const res: Record<string, unknown> = {};
    params.forEach((param) => {
        res[param.name] = param.value;
    });
    return res;
}

function _resolveHref(href: string, mask: string, cfg: Record<string, unknown>): string {
    const params = _calculateParams(mask, cfg);
    const cfgParams = _getCfgParams(params);
    const urlParams = _getUrlParams(params);

    const toFind = _getMaskFindValue(mask, urlParams, href);
    const toReplace = _getMaskReplaceValue(mask, cfgParams);

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

function _getMaskFindValue(mask: string, urlParams: Record<string, unknown>, href: string): string {
    let findValue = _resolveMask(mask, urlParams);

    // Если полную маску не получается найти в URL, но есть префикс
    // этой маски, который совпадает с окончанием URL-адреса, можно
    // использовать его в качестве findValue
    //
    // Например, текущий адрес: /page/posts
    // Маска: page/:pName/:pParam, urlParams: { pName: "posts", pParam: undefined }
    // Полная маска не вычислится, так как есть неопределенный параметр. Но при этом
    // неполную маску page/:pName можно вычислить, и так как page/posts находится
    // в самом конце адреса, эту строку можно безопасно вернуть в качестве findValue.
    if (!findValue) {
        findValue = _getIncompleteMaskFindValue(mask, urlParams, href);
    }

    return findValue;
}

function _getIncompleteMaskFindValue(mask: string, urlParams: Record<string, unknown>, href: string): string {
    let incompleteMask = mask;
    while (_isSlashMask(incompleteMask) && _maskHasParams(incompleteMask)) {
        // Пока в маске есть слэши и параметры, отрезаем от маски часть после последнего
        // слэша и вычисляем неполную маску
        incompleteMask = _removeLastSlashPart(incompleteMask);
        const findValue = _resolveMask(incompleteMask, urlParams);

        // Если неполная маска вычислена, и при этом находится в самом конце
        // href, можно вернуть ее в качестве findValue
        if (findValue && _hrefMainPartEndsWith(href, findValue)) {
            return findValue;
        }
    }

    // Если подходящую неполную маску найти не удалось findValue будет
    // пустой, то есть новое значение будет добавляться к URL, а не
    // заменять старое
    return '';
}

function _hrefMainPartEndsWith(href: string, ending: string): boolean {
    // Основная часть URL заканчивается маской, если эта маска присутствует
    // в адресе, при этом сразу после нее идет конец строки, или начинаются
    // query или hash
    const escapedEnding = _escapeForRegex(ending);
    const endingPattern = `${escapedEnding}/?($|\\?|#)`;
    return new RegExp(endingPattern).test(href);
}

function _getMaskReplaceValue(mask: string, cfgParams: Record<string, unknown>): string {
    const encodedParams = _mapParams(cfgParams, _encodeParam);
    return _resolveMask(mask, encodedParams);
}

function _resolveMask(mask: string, params: Record<string, unknown>): string {
    let paramCount = 0;
    let resolvedCount = 0;
    let resolvedMask = mask;

    _matchParams(resolvedMask, (param) => {
        paramCount++;
        if (params[param.name] !== undefined) {
            resolvedCount++;
            resolvedMask = resolvedMask.replace(':' + param.name, params[param.name] as string);
        }
    });

    let result = '';
    if (resolvedCount === paramCount) {
        result = resolvedMask;
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

function _mapParams(obj: Record<string, unknown>, cb: (val: unknown) => string): Record<string, string> {
    const result = {};
    for (const i in obj) {
        if (obj.hasOwnProperty(i)) {
            result[i] = cb(obj[i]);
        }
    }
    return result;
}

function _encodeParam(param: unknown): string {
    const type = typeof param;
    let result = param;
    if (type !== 'undefined') {
        if (type !== 'string') {
            // Convert parameter to string by calling JSON.stringify
            result = JSON.stringify(result);
        }
        result = encodeURIComponent(result as string);
    }
    return result as string;
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

function _isSlashMask(mask: string): boolean {
    return mask.indexOf('/') >= 0;
}

function _isQueryMask(mask: string): boolean {
    return mask.indexOf('=') >= 0;
}

function _maskHasParams(mask: string): boolean {
    return mask.indexOf(':') >= 0;
}

function _removeLastSlashPart(url: string): string {
    let result = url;
    const lastSlash = url.lastIndexOf('/');
    if (lastSlash >= 0) {
        result = url.slice(0, lastSlash);
    }
    return result;
}

// Символы, которые должны быть экранированы при использовании в регулярном
// выражении
const escapedCharacters = /[|\\{}()[\]^$+*?.-]/g;
function _escapeForRegex(str: string): string {
    // Перед всеми символами, которые необходимо экранировать,
    // добавляем бэк-слэш
    return str.replace(escapedCharacters, '\\$&');
}
