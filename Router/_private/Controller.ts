/// <amd-module name="Router/_private/Controller" />

/**
 * Набор общих функций для управления в системе роутинга.
 * @module Router/_private/Controller
 * @author Санников К.А.
 * @public
 */


import * as Data from './Data';
import { getAppNameByUrl } from './MaskResolver';
import * as History from './History';
import * as UrlRewriter from './UrlRewriter';

let isNavigating: boolean = false;

_initializeController();

/*
 * Checks if Router can switch the currently active application.
 * This can only be done if the page has an Application/Core controller instance.
 * @function
 * @returns {Boolean} can Router switch the active application
 */
/**
 * Определяет, может ли система роутинга переключить текущее приложение без перезагрузки страницы.
 * Это можно сделать только в том случае, если на странице есть экземпляр {@link Application/Core}.
 * @function
 * @returns {Boolean} Возможно ли изменить текущее приложение без перезагрузки страницы.
 */
export function canChangeApplication(): boolean {
   // Router can switch applications when there is an Application/Core
   // instance on it
   return !!Data.getCoreInstance();
}

/*
 *
 * Performs the single page navigation (without reloading the page) to a new
 * state
 * @function
 * @param {Data.IHistoryState} newState state to navigate to
 * @param {Function} [callback] optional callback that will be called instead of window.history.push
 * @param {Function} [errback] optional errback that will be called if one of the Routes rejected the navigation
 */
/**
 *
 * Производит single-page переход (без перезагрузки страницы) к новому состоянию (URL-адресу).
 * @function
 * @param {Data.IHistoryState} newState Состояние для перехода.
 * @param {Function} [callback] Необязательная функция, будет вызвана вместо window.history.push.
 * @param {Function} [errback] Необязательная функция, будет вызвана если один из компонентов Route отменит переход
 */
export function navigate(newState: Data.IHistoryState, callback?: Function, errback?: Function): void {
   const rewrittenNewUrl: string = UrlRewriter.get(newState.state);
   const prettyUrl: string = newState.href || UrlRewriter.getReverse(rewrittenNewUrl);
   const currentState: Data.IHistoryState = History.getCurrentState();

   if (currentState.state === rewrittenNewUrl || isNavigating) {
      return;
   }
   const rewrittenNewState: Data.IHistoryState = {
      state: rewrittenNewUrl,
      href: prettyUrl
   };
   isNavigating = true;

   const tryApplyNewStateCallback = (accept: boolean) => {
      isNavigating = false;
      if (accept) {
         if (callback) {
            callback();
         } else {
            History.push(rewrittenNewState);
         }
         _notifyStateChanged(rewrittenNewState, currentState);
      } else if (errback) {
         errback();
      }
   };
   const tryApplyNewStateErrback = (err: Error) => {
      isNavigating = false;
      if (errback) {
         errback(err);
      }
   };

   let result: Promise<boolean> | boolean;
   try {
      result = _tryApplyNewState(rewrittenNewState);
   } catch(err) {
      tryApplyNewStateErrback(err);
      return;
   }

   if (result instanceof Promise) {
      result.then(tryApplyNewStateCallback, tryApplyNewStateErrback);
      return;
   }
   tryApplyNewStateCallback(result);
}

/*
 *
 * Performs the single page navigation while replacing the current history state
 * instead of adding a new one
 * @function
 * @param {Data.IHistoryState} newHistoryState state to navigate to
 * @see Router/_private/Controller#navigate
 */
/**
 *
 * Производит переход без перезагрузки страницы без добавления новой записи в историю переходов (вместо этого заменяет текущую).
 * @function
 * @param {Data.IHistoryState} newHistoryState Состояние для перехода.
 * @see Router/_private/Controller#navigate
 */
export function replaceState(newHistoryState: Data.IHistoryState): void {
    const rewrittenState: string = UrlRewriter.get(newHistoryState.state);
    const rewrittenHref: string = newHistoryState.href || UrlRewriter.getReverse(rewrittenState);
    const rewrittenHistoryState: Data.IHistoryState = {
        state: rewrittenState,
        href: rewrittenHref
    };

    navigate(rewrittenHistoryState, () => History.replaceState(rewrittenHistoryState));
}

export function addRoute(
    route: Data.IRegisterableComponent,
    beforeUrlChangeCb: Data.TStateChangeFunction = () => { return true; },
    afterUrlChangeCb: Data.TStateChangeFunction = () => { return true; }
): void {
   Data.getRegisteredRoutes()[route.getInstanceId()] = {
      beforeUrlChangeCb,
      afterUrlChangeCb
   };
}

export function removeRoute(route: Data.IRegisterableComponent): void {
   delete Data.getRegisteredRoutes()[route.getInstanceId()];
}

export function addReference(
    reference: Data.IRegisterableComponent,
    afterUrlChangeCb: Data.TStateChangeFunction
): void {
   Data.getRegisteredReferences()[reference.getInstanceId()] = {
      afterUrlChangeCb
   };
}

export function removeReference(reference: Data.IRegisterableComponent): void {
   delete Data.getRegisteredReferences()[reference.getInstanceId()];
}

function _initializeController(): void {
   if (typeof window !== 'undefined') {
      let skipNextChange: boolean = false;
      window.onpopstate = (event: PopStateEvent) => {
         if (skipNextChange) {
            skipNextChange = false;
            return;
         }

         const currentState: Data.IHistoryState = History.getCurrentState();
         const prevState: Data.IHistoryState = History.getPrevState();
         if ((!event.state && !prevState) || (event.state && event.state.id < currentState.id)) {
            // going back
            const navigateToState: Data.IHistoryState = _getNavigationState(
               prevState,
               event.state,
               event.state || prevState ? Data.getRelativeUrl() : Data.getVisibleRelativeUrl()
            );
            navigate(navigateToState, () => History.back(navigateToState));
         } else {
            // going forward
            const nextState: Data.IHistoryState = History.getNextState();
            const navigateToState: Data.IHistoryState =
               _getNavigationState(nextState, event.state, Data.getRelativeUrl());
            navigate(
               navigateToState,
               () => History.forward(navigateToState),
               () => {
                  // unable to navigate to specified state, going back in history
                  skipNextChange = true;
                  window.history.back();
               }
            );
         }
      };
   }
}

function _getNavigationState(
   localState: Data.IHistoryState,
   windowState: Data.IHistoryState,
   currentUrl: string
): Data.IHistoryState {
   if (!localState) {
      if (windowState && windowState.state && windowState.href) {
         return windowState;
      } else {
         return {
            state: UrlRewriter.get(currentUrl),
            href: currentUrl
         };
      }
   } else if (windowState && windowState.state && windowState.href) {
      return windowState;
   }
   return localState;
}

function _tryApplyNewState(newState: Data.IHistoryState): Promise<boolean> | boolean {
   const currentState: Data.IHistoryState = History.getCurrentState();
   const newApp: string = getAppNameByUrl(newState.state);
   const currentApp: string = getAppNameByUrl(currentState.state);

   const callback = (res: boolean): boolean => {
      if (newApp === currentApp) {
         return res;
      }
      // Переходим без СПА, потому что сломалась синхронизация HEAD
      // при несовпадении VirtualDom inferno разрушает HEAD. Нужно
      // допатчить инферно так, чтобы под капотом библиотека НИКОГДА
      // не удаляла HEAD и HTML
      window.location.href = newState.href;
      return false;
   };

   const result: Promise<boolean> | boolean = _callBeforeUrlChangeCallbacks(newState);
   if (result instanceof Promise) {
      return result.then((res) => callback(res));
   }
   return callback(result);
}

/**
 * Вызов всех предобработчиков смены url-адреса
 * Результат может быть как Promise<boolean> так и просто boolean - всё зависит от того,
 * что вернут эти самые предобработчики
 * @param newState
 * @returns
 */
function _callBeforeUrlChangeCallbacks(newState: Data.IHistoryState): Promise<boolean> | boolean {
   const currentState: Data.IHistoryState = History.getCurrentState();
   const registeredRoutes: Record<string, Data.IRegisteredRoute> = Data.getRegisteredRoutes();

   // Если нет обработчиков для route'ов, то не меняем текущий url
   if (!Object.keys(registeredRoutes).length) {
      return false;
   }

   // вызовы АСИНХРОННЫХ предобработчиков смены url-адреса
   let beforeUrlChangePromises: Promise<boolean>[] = [];
   // вызовы СИНХРОННЫХ предобработчиков смены url-адреса
   const beforeUrlChangeResults: boolean[] = [];

   for (const routeId in registeredRoutes) {
      if (!registeredRoutes.hasOwnProperty(routeId)) {
         continue;
      }
      const route: Data.IRegisteredRoute = registeredRoutes[routeId];
      const beforeCb: Promise<boolean> | boolean = route.beforeUrlChangeCb(newState, currentState);
      if (beforeCb instanceof Promise) {
         beforeUrlChangePromises.push(beforeCb);
      } else {
         beforeUrlChangeResults.push(beforeCb);
      }
   }

   // АСИНХРОННЫЙ результат выполнения предобработчиков смены url-адреса
   if (beforeUrlChangePromises.length) {
      beforeUrlChangePromises = beforeUrlChangePromises.concat(beforeUrlChangeResults.map((r) => Promise.resolve(r)));
      return Promise.all(beforeUrlChangePromises).then((results) => results.indexOf(false) === -1);
   }

   // СИНХРОННЫЙ результат выполнения предобработчиков смены url-адреса
   return beforeUrlChangeResults.indexOf(false) === -1;
}

function _notifyStateChanged(newState: Data.IHistoryState, oldState: Data.IHistoryState): void {
   const registeredRoutes: Record<string, Data.IRegisteredRoute> = Data.getRegisteredRoutes();
   const registeredReferences: Record<string, Data.IRegisteredReference> = Data.getRegisteredReferences();

   for (const routeId in registeredRoutes) {
      if (registeredRoutes.hasOwnProperty(routeId)) {
         registeredRoutes[routeId].afterUrlChangeCb(newState, oldState);
      }
   }

   for (const referenceId in registeredReferences) {
      if (registeredReferences.hasOwnProperty(referenceId)) {
         registeredReferences[referenceId].afterUrlChangeCb(newState, oldState);
      }
   }
}
