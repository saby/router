/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @author Мустафин Л.И.
 * @private
 * @deprecated
 */

import { IUrlParams, IUrlQueryParams } from '../MaskResolver/UrlModifier';
import { getRootRouter } from '../Router/Router';

/**
 * Извлекает значения из текущего адреса по заданной маске.
 * @function
 * @param Параметризованная маска, напр. "/doc/:guid?tab=:tabId". Подробнее о масках читайте <a href="/doc/platform/developmentapl/interface-development/routing/mask-and-syntax/">здесь</a>.
 * @param Адрес, из которого будут извлекаться значения. По умолчанию используется текущий URL.
 * @returns Объект, в котором ключи - названия параметров, а значения - значения параметров.
 * @public
 * @deprecated
 */
export function calculateUrlParams(
    mask: string,
    currentUrl?: string
): Record<string, string> {
    return getRootRouter().maskResolver.calculateUrlParams(mask, currentUrl);
}

/**
 * Вычисляет новый URL-адрес, применяя к текущему маску и значения параметров для ее заполнения.
 * @function
 * @param mask Параметризованная маска, напр. "/doc/:guid?tab=:tabId". Подробнее о масках читайте <a href="/doc/platform/developmentapl/interface-development/routing/mask-and-syntax/">здесь</a>.
 * @param cfg Объект со значениями параметров, используемых в маске.
 * @param currentUrl Url адрес, с которым будет работать метод. Необязательный параметр.
 * @returns Вычисленный адрес.
 * @public
 * @deprecated
 */
export function calculateHref(
    mask: string,
    cfg: Partial<IUrlParams>,
    currentUrl?: string
): string {
    return getRootRouter().maskResolver.calculateHref(mask, cfg, currentUrl);
}

/**
 * Вычисляет новый URL-адрес, применяя к текущему/переданному url адресу значения из входного объекта.
 * Модифицируется только query-часть url адреса.
 * @function
 * @param cfg Объект со значениями query параметров, которые необходимо добавить в url адрес.
 * Если передать clearFragment: true, то из url адреса будет удален <a href="/doc/platform/developmentapl/interface-development/routing/mask-and-syntax/#mask-types">fragment</a>.
 * @param currentUrl Url адрес, с которым будет работать метод. Необязательный параметр.
 * @returns Вычисленный адрес.
 * @public
 * @deprecated
 */
export function calculateQueryHref(
    cfg: Partial<IUrlQueryParams>,
    currentUrl?: string
): string {
    return getRootRouter().maskResolver.calculateQueryHref(cfg, currentUrl);
}
