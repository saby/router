/// <amd-module name="Router/_private/MaskResolver" />

/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @name Router/_private/MaskResolver
 * @author Мустафин Л.И.
 */

import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';
import {UrlParamsGetter} from './MaskResolver/UrlParamsGetter';
import {UrlModifier} from './MaskResolver/UrlModifier';

// TODO Remove this? используется в Route.Controller
export function getAppNameByUrl(url: string): string {
    let folderName: string = UrlRewriter.get(url) || '';

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

    return folderName + '/Index';
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
export function calculateUrlParams(mask: string, url?: string): Record<string, string> {
    const getter: UrlParamsGetter = new UrlParamsGetter(mask, url || UrlRewriter.get(Data.getRelativeUrl()));
    return getter.get();
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
    const modifier: UrlModifier = new UrlModifier(mask, cfg, UrlRewriter.get(Data.getRelativeUrl()));
    return modifier.modify();
}
