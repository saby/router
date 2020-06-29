/**
 *
 */

import {IUrlParts, UrlPartsManager} from './UrlPartsManager';
import {IoC} from "Env/Env";

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
 *
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

    private static isPathFragment(mask: string, fragment: string): boolean {
        if (!fragment) {
            return false;
        }
        if (mask.indexOf('#') === 0) {
            return true;
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

    private static isQueryFragment(mask: string, fragment: string): boolean {
        if (!fragment) {
            return false;
        }
        if (mask.indexOf('#') === 0) {
            return true;
        }
        const reQueryParam: RegExp = /([^\/?&#:]+=)/g;
        let match: RegExpMatchArray = reQueryParam.exec(mask);
        while (match) {
            if (fragment.indexOf(match[1]) > -1) {
                return true;
            }
            match = reQueryParam.exec(mask);
        }
        return false;
    }
}
