/**
 * Набор методов для хранения состояний истории роутера
 * @module
 * @author Мустафин Л.И.
 * @private
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */

import { getRootRouter } from '../Router/Router';
import { IHistoryState } from '../DataInterfaces';

/**
 * Возвращает список состояний истории роутера.
 * @returns Список состояний истории.
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function getHistory(): IHistoryState[] {
    return getRootRouter().history.getHistory();
}

/**
 * Возвращает индекс активного в данный момент состояния истории
 * @returns индекс активного состояния истории
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function getHistoryPosition(): number {
    return getRootRouter().history.getHistoryPosition();
}

/**
 * Добавляет в начало переданного/текущего url-адреса префикс сервиса
 * @param url
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function getRelativeUrlWithService(url?: string): string {
    return getRootRouter().url.getServiceUrl(url);
}

/**
 * Возвращает текущее значение действительного URL, с которым работает роутинг.
 * @returns действительный URL
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function getRelativeUrl(): string {
    return getRootRouter().url.getStateUrl();
}

/**
 * Получить текущее значение "красивого" URL, отображаемого пользователю.
 * @returns Значение красивого URL.
 * @deprecated
 * Используйте методы объекта Router из контекста {@link https://wi.sbis.ru/docs/js/UICore/Contexts/methods/WasabyContextManager/ WasabyContextManager}.
 * Подробнее в статье "{@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d Доступ к методам API роутинга}".
 */
export function getVisibleRelativeUrl(): string {
    return getRootRouter().url.getUrl();
}
