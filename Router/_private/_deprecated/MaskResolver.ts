/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @author Мустафин Л.И.
 * @private
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */

import { IUrlParams, IUrlQueryParams } from '../MaskResolver/UrlModifier';
import { getRootRouter } from '../Router/Router';

/**
 * Извлекает значения из текущего адреса по заданной маске.
 * @param mask Параметризованная маска, напр. "/doc/:guid?tab=:tabId". Подробнее о масках читайте <a href="https://link.sbis.ru/article/wasaby/eec9bf40-4589-4a40-b841-a4e12fbd3f08#toc_26ad4d13-1927-4939-86ab-4b4679cb1ea2">здесь</a>.
 * @param currentUrl Адрес, из которого будут извлекаться значения. По умолчанию используется текущий URL.
 * @returns Объект, в котором ключи - названия параметров, а значения - значения параметров.
 * @public
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function calculateUrlParams(
    mask: string,
    currentUrl?: string
): Record<string, string> {
    return getRootRouter().maskResolver.calculateUrlParams(mask, currentUrl);
}

/**
 * Вычисляет новый URL-адрес, применяя к текущему маску и значения параметров для ее заполнения.
 * @param mask Параметризованная маска, напр. "/doc/:guid?tab=:tabId". Подробнее о масках читайте <a href="https://link.sbis.ru/article/wasaby/eec9bf40-4589-4a40-b841-a4e12fbd3f08#toc_26ad4d13-1927-4939-86ab-4b4679cb1ea2">здесь</a>.
 * @param cfg Объект со значениями параметров, используемых в маске.
 * @param currentUrl Url адрес, с которым будет работать метод. Необязательный параметр.
 * @returns Вычисленный адрес.
 * @public
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
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
 * @param cfg Объект со значениями query параметров, которые необходимо добавить в url адрес.
 * Если передать clearFragment: true, то из url адреса будет удален <a href="https://link.sbis.ru/article/wasaby/eec9bf40-4589-4a40-b841-a4e12fbd3f08#toc_26ad4d13-1927-4939-86ab-4b4679cb1ea2">fragment</a>.
 * @param currentUrl Url адрес, с которым будет работать метод. Необязательный параметр.
 * @returns Вычисленный адрес.
 * @public
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function calculateQueryHref(
    cfg: Partial<IUrlQueryParams>,
    currentUrl?: string
): string {
    return getRootRouter().maskResolver.calculateQueryHref(cfg, currentUrl);
}
