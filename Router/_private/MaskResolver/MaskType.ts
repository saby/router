/**
 * Набор методов, которые определяют тип маски, по которой нужно обработать текущий url
 */

import {IoC} from "Env/Env";
import {UrlParts} from './UrlParts';
import {getParamsFromQueryString} from './Helpers';

/**
 * Типы поддерживаемых масок
 */
export enum MaskType {
    Undefined,  // неопределенный тип
    Path,  // маска вида /path/:param
    Query,  // маска вида query=:value
    PathFragment,  // маска фрагмента url, часть после # вида path/:param
    QueryFragment  // маска фрагмента url, часть после # вида query=:value
}

/**
 * Интерфейс, который описывает тип части маски.
 * Маска может быть сложной (param/:value?query=:val) - поэтому каждая часть рассматривается как отдельная маска.
 */
export interface IMaskType {
    mask: string;
    maskType: MaskType;
}

/**
 * Определяет тип маски.
 * Маска может быть сложной (param/:value?query=:val) - поэтому каждая часть рассматривается как отдельная маска.
 */
export function calculateMaskType(mask: string, urlParts: UrlParts): IMaskType[] {
    // тут главное разбить на "условные" составные части: path, query, fragment
    const maskParts: UrlParts = new UrlParts(mask);

    const result: IMaskType[] = [];

    [maskParts.getPath(), maskParts.getQuery(), maskParts.getFragment()].forEach((maskPart) => {
        if (!maskPart) {
            return;
        }
        result.push({
            mask: maskPart,
            maskType: _calcMaskType(maskPart, urlParts)
        });
    });

    return result;
}

/**
 * Вычисление типа маски по указанной части маски
 */
function _calcMaskType(mask: string, urlParts: UrlParts): MaskType {
    // par1/:val1 - это либо path либо fragment
    if (mask.indexOf('/') > -1) {
        return _isPathFragment(mask, urlParts) ? MaskType.PathFragment : MaskType.Path;
    }
    // par1=:val1 - это либо query либо fragment
    if (mask.indexOf('=') > -1) {
        return _isQueryFragment(mask, urlParts) ? MaskType.QueryFragment : MaskType.Query;
    }
    IoC.resolve('ILogger').error('Router.MaskResolver', `Mask "${mask}" is invalid`);
    return MaskType.Undefined;
}

/**
 * Проверить, что маска для фрагмента url'а или нет. Проверить fragment вида #param/value
 * Из фрагмента на входе поэлементно проверит, что fragment хоть частично совпадает с ним
 * @param mask  маска, напр. param/:value
 * @param urlParts  фрагмент url'а, напр. #param/value
 */
function _isPathFragment(mask: string, urlParts: UrlParts): boolean {
    if (mask.indexOf('#') === 0) {
        return true;
    }
    const fragment: string = urlParts.getFragment();
    if (!fragment) {
        return false;
    }
    const reQueryParam: RegExp = /([^\/?&#:]+\/):[^\/?&#]/g;
    let match: RegExpMatchArray = reQueryParam.exec(mask);
    while (match) {
        if (fragment.indexOf(match[1]) > -1) {
            return true;
        }
        match = reQueryParam.exec(mask);
    }
    return false;
}

/**
 * Проверить, что маска для фрагмента url'а или нет. Проверить fragment вида #param=value
 * Из фрагмента на входе поэлементно проверит, что fragment хоть частично совпадает с ним
 * @param mask  маска, напр. param=:value
 * @param urlParts  фрагмент url'а, напр. #param=value
 */
function _isQueryFragment(mask: string, urlParts: UrlParts): boolean {
    if (mask.indexOf('#') === 0) {
        return true;
    }
    const fragment: string = urlParts.getFragment();
    if (!fragment) {
        return false;
    }
    const maskParams: Record<string, string> = getParamsFromQueryString(mask, true);
    const urlParams: Record<string, string> = getParamsFromQueryString(fragment);
    for (const urlId in maskParams) {
        if (maskParams.hasOwnProperty(urlId) && urlParams.hasOwnProperty(urlId)) {
            return true;
        }
    }
    return false;
}
