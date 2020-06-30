/**
 * Набор методов, которые определяют тип маски, по которой нужно обработать текущий url
 */

import {IUrlParts, UrlPartsManager} from './UrlPartsManager';
import {IoC} from "Env/Env";
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
 * Класс, который определяет тип маски
 */
export class MaskTypeManager {
    static calculateMaskType(mask: string, url: string): MaskType {
        const urlParts: IUrlParts = UrlPartsManager.getUrlParts(url);
        // par1/:val1 - это либо path либо fragment
        if (mask.indexOf('/') > -1) {
            return MaskTypeManager.isPathFragment(mask, urlParts.fragment) ? MaskType.PathFragment : MaskType.Path;
        }
        // par1=:val1 - это либо query либо fragment
        if (mask.indexOf('=') > -1) {
            return MaskTypeManager.isQueryFragment(mask, urlParts.fragment) ? MaskType.QueryFragment : MaskType.Query;
        }
        IoC.resolve('ILogger').error('Router.MaskResolver', `Mask "${mask}" is invalid`);
        return MaskType.Undefined;
    }

    /**
     * Проверить, что маска для фрагмента url'а или нет. Проверить fragment вида #param/value
     * Из фрагмента на входе поэлементно проверит, что fragment хоть частично совпадает с ним
     * @param mask  маска, напр. param/:value
     * @param fragment  фрагмент url'а, напр. #param/value
     */
    private static isPathFragment(mask: string, fragment: string): boolean {
        if (mask.indexOf('#') === 0) {
            return true;
        }
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
     * @param fragment  фрагмент url'а, напр. #param=value
     */
    private static isQueryFragment(mask: string, fragment: string): boolean {
        if (mask.indexOf('#') === 0) {
            return true;
        }
        if (!fragment) {
            return false;
        }
        const maskParams: Record<string, string> = getParamsFromQueryString(mask);
        const urlParams: Record<string, string> = getParamsFromQueryString(fragment);
        for (const urlId in maskParams) {
            if (maskParams.hasOwnProperty(urlId) && urlParams.hasOwnProperty(urlId)) {
                return true;
            }
        }
        return false;
    }
}
