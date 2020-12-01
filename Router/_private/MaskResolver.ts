/// <amd-module name="Router/_private/MaskResolver" />

/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @author Мустафин Л.И.
 * @public
 */

import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';
import {UrlParamsGetter} from './MaskResolver/UrlParamsGetter';
import {UrlQueryModifier, UrlModifier} from './MaskResolver/UrlModifier';

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
 * @function
 * Extract values from the current URL based on the specified mask
 * @param {String} mask mask with parameter placeholders
 * @param {String} [url] URL to extract values from (current URL will be used by default)
 * @returns {Record<string, string>} the key-value store of extracted parameters
 * @public
 */
/**
 * Извлекает значения из текущего адреса по заданной маске.
 * @function
 * @param {String} mask Параметризованная маска.
 * @param {String} [url] Адрес, из которого будут извлекаться значения. По умолчанию используется текущий URL.
 * @returns {Record<string, string>} Объект, в котором ключи - названия параметров, а значения - значения параметров.
 * @public
 */
export function calculateUrlParams(mask: string, url?: string): Record<string, string> {
    const getter: UrlParamsGetter = new UrlParamsGetter(mask, url || UrlRewriter.get(Data.getRelativeUrl()));
    return getter.get();
}

/*
 * @function
 * Calculates a new URL based on the current URL, specified mask
 * and the hash map of parameters to fill the mask
 * @param {String} mask mask with parameter placeholders
 * @param {Record<string, string>} cfg key-value store with specified parameters
 * @returns {String} the new calculated URL
 * @public
 */
/**
 * Вычисляет новый URL-адрес, применяя к текущему маску и значения параметров для ее заполнения.
 * @function
 * @param {String} mask Параметризованная маска.
 * @param {Record<string, string>} cfg Объект со значениями параметров, используемых в маске.
 * @param currentUrl Url адрес, с которым будет работать метод. Необязательный параметр.
 * @returns {String} Вычисленный адрес.
 * @public
 */
export function calculateHref(mask: string, cfg: Record<string, unknown>, currentUrl?: string): string {
    const modifier: UrlModifier = new UrlModifier(mask, cfg, currentUrl || UrlRewriter.get(Data.getRelativeUrl()));
    return modifier.modify();
}

/**
 * Вычисляет новый URL-адрес, применяя к текущему/переданному url адресу значения из входного объекта.
 * Модифицируется только query-часть url адреса.
 * @function
 * @param {Record<string, string>} cfg Объект со значениями query параметров, которые необходимо добавить в url адрес.
 * @param currentUrl Url адрес, с которым будет работать метод. Необязательный параметр.
 * @returns {String} Вычисленный адрес.
 * @public
 */
export function calculateQueryHref(cfg: Record<string, unknown>, currentUrl?: string): string {
    const modifier: UrlQueryModifier = new UrlQueryModifier(cfg, currentUrl || UrlRewriter.get(Data.getRelativeUrl()));
    return modifier.modify();
}
