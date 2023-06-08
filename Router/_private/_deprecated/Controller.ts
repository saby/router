/**
 * Набор методов для взаимодействия с Историей Роутера
 * @module
 * @author Мустафин Л.И.
 * @private
 * @deprecated
 */

import { getRootRouter } from '../Router/Router';
import {
    IHistoryState,
    IRegisterableComponent,
    TStateChangeFunction,
} from '../DataInterfaces';

/**
 * Производит single-page переход (без перезагрузки страницы) к новому состоянию (URL-адресу).
 * @function
 * @param {Router/router:IHistoryState} newState Состояние для перехода.
 * @param [callback] Необязательная функция, будет вызвана вместо window.history.pushState.
 * @param [errback] Необязательная функция, будет вызвана если один из компонентов Route отменит переход.
 *
 * @example
 * <pre>
 * import { Controller } from 'Router/router';
 * const state: IHistoryState = {state: 'some/new/state', href: 'pretty_url'}
 * Controller.navigate(state, () => window.history.pushState(state, state.href), (err) => alert(err.message));
 * </pre>
 * @deprecated
 */
export function navigate(
    newState: IHistoryState,
    callback?: () => void | boolean,
    errback?: (err?: Error) => void
): void {
    getRootRouter().navigate(newState, callback, errback);
}

/**
 * Производит переход без перезагрузки страницы без добавления новой записи в историю переходов (вместо этого заменяет текущую).
 * @function
 * @param {Router/router:IHistoryState} newHistoryState Состояние для перехода.
 * @param callback Функция, которая будет вызвана после изменения URL адреса в адресной строке
 * @see Router/_private/Controller#navigate
 *
 * @example
 * <pre>
 * import { Controller } from 'Router/router';
 * const state: IHistoryState = {state: 'some/new/state'}
 * Controller.replaceState(state, (newState) => alert('Переход совершён!'));
 * </pre>
 * @deprecated
 */
export function replaceState(
    newHistoryState: IHistoryState,
    callback?: (rewrittenHistoryState: IHistoryState) => void
): void {
    getRootRouter().replaceState(newHistoryState, callback);
}

/**
 * @hidden
 * @deprecated
 */
export function addRoute(
    route: IRegisterableComponent,
    beforeUrlChangeCb: TStateChangeFunction,
    afterUrlChangeCb: TStateChangeFunction
): void {
    getRootRouter()._manager.addRoute(
        route,
        beforeUrlChangeCb,
        afterUrlChangeCb
    );
}

/**
 * @hidden
 * @deprecated
 */
export function removeRoute(route: IRegisterableComponent): void {
    getRootRouter()._manager.removeRoute(route);
}
