/**
 * Набор методов для хранения состояний истории роутера
 * @module
 * @author Мустафин Л.И.
 * @private
 * @deprecated
 */

import { getRootRouter } from '../Router/Router';
import { IHistoryState } from '../DataInterfaces';

/**
 * Возвращает список состояний истории роутера.
 * @function
 * @returns {IHistoryState[]} Список состояний истории.
 * @deprecated
 */
export function getHistory(): IHistoryState[] {
    return getRootRouter().history.getHistory();
}

/**
 * Возвращает индекс активного в данный момент состояния истории
 * @function
 * @returns {Number} индекс активного состояния истории
 * @deprecated
 */
export function getHistoryPosition(): number {
    return getRootRouter().history.getHistoryPosition();
}

/**
 * Добавляет в начало переданного/текущего url-адреса префикс сервиса
 * @param url
 * @deprecated
 */
export function getRelativeUrlWithService(url?: string): string {
    return getRootRouter().url.getStateUrlWithService(url);
}

/**
 * Возвращает текущее значение действительного URL, с которым работает роутинг.
 * @function
 * @returns {String} действительный URL
 * @deprecated
 */
export function getRelativeUrl(): string {
    return getRootRouter().url.getStateUrl();
}

/**
 * Получить текущее значение "красивого" URL, отображаемого пользователю.
 * @function
 * @returns {String} Значение красивого URL.
 * @deprecated
 */
export function getVisibleRelativeUrl(): string {
    return getRootRouter().url.getUrl();
}
