/// <amd-module name="Router/_private/Controller" />

/**
 * Набор общих функций для управления в системе роутинга.
 * @module
 * @name Router/_private/Controller
 * @author Черваков Д.В.
 */

import { IoC } from 'Env/Env';

import * as Data from './Data';

import { getAppNameByUrl } from './MaskResolver';
import * as History from './History';
import * as UrlRewriter from './UrlRewriter';

let isNavigating = false;

_initializeController();

/*
 * Checks if Router can switch the currently active application.
 * This can only be done if the page has an Application/Core controller instance.
 * @name Router/_private/Controller#canChangeApplication
 * @function
 * @returns {Boolean} can Router switch the active application
 */
/**
 * Определяет, может ли система роутинга переключить текущее приложение без перезагрузки страницы.
 * Это можно сделать только в том случае, если на странице есть экземпляр {@link Application/Core}.
 * @function
 * @name Router/_private/Controller#canChangeApplication
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
 * @name Router/_private/Controller#navigate
 * @param {Data.IHistoryState} newState state to navigate to
 * @param {Function} [callback] optional callback that will be called instead of window.history.push
 * @param {Function} [errback] optional errback that will be called if one of the Routes rejected the navigation
 */
/**
 *
 * Производит single-page переход (без перезагрузки страницы) к новому состоянию (URL-адресу).
 * @function
 * @name Router/_private/Controller#navigate
 * @param {Data.IHistoryState} newState Состояние для перехода.
 * @param {Function} [callback] Необязательная функция, будет вызвана вместо window.history.push.
 * @param {Function} [errback] Необязательная функция, будет вызвана если один из компонентов Route отменит переход
 */
export function navigate(newState: Data.IHistoryState, callback?: Function, errback?: Function): void {
   const rewrittenNewUrl = UrlRewriter.get(newState.state);
   const prettyUrl = newState.href || UrlRewriter.getReverse(rewrittenNewUrl);
   const currentState = History.getCurrentState();

   if (currentState.state === rewrittenNewUrl || isNavigating) {
      return;
   }
   const rewrittenNewState: Data.IHistoryState = {
      state: rewrittenNewUrl,
      href: prettyUrl
   };

   isNavigating = true;
   _tryApplyNewState(rewrittenNewState).then(
        (accept) => {
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
      },
        (err) => {
         isNavigating = false;
         if (errback) {
                errback(err);
      }
        }
   );
}

/*
 *
 * Performs the single page navigation while replacing the current history state
 * instead of adding a new one
 * @function
 * @name Router/_private/Controller#replaceState
 * @param {Data.IHistoryState} newHistoryState state to navigate to
 * @see Router/_private/Controller#navigate
 */
/**
 *
 * Производит переход без перезагрузки страницы без добавления новой записи в историю переходов (вместо этого заменяет текущую).
 * @function
 * @name Router/_private/Controller#replaceState
 * @param {Data.IHistoryState} newHistoryState Состояние для перехода.
 * @see Router/_private/Controller#navigate
 */
export function replaceState(newHistoryState: Data.IHistoryState): void {
    const rewrittenState = UrlRewriter.get(newHistoryState.state);
    const rewrittenHref = newHistoryState.href || UrlRewriter.getReverse(rewrittenState);
    const rewrittenHistoryState: Data.IHistoryState = {
        state: rewrittenState,
        href: rewrittenHref
    };

    navigate(rewrittenHistoryState, () => History.replaceState(rewrittenHistoryState));
}

export function addRoute(
    route: Data.IRegisterableComponent,
    beforeUrlChangeCb: Data.TStateChangeFunction = () => { return Promise.resolve(true); },
    afterUrlChangeCb: Data.TStateChangeFunction = () => { return Promise.resolve(true); }
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
      let skipNextChange = false;
      window.onpopstate = (event: PopStateEvent) => {
         if (skipNextChange) {
            skipNextChange = false;
            return;
         }

         const currentState = History.getCurrentState();
         const prevState = History.getPrevState();
         if ((!event.state && !prevState) || (event.state && event.state.id < currentState.id)) {
            // going back
            const navigateToState = _getNavigationState(
               prevState,
               event.state,
               event.state || prevState ? Data.getRelativeUrl() : Data.getVisibleRelativeUrl()
            );
            navigate(navigateToState, () => History.back());
         } else {
            // going forward
            const nextState = History.getNextState();
            const navigateToState = _getNavigationState(nextState, event.state, Data.getRelativeUrl());
            navigate(
               navigateToState,
               () => History.forward(),
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
   }
   return localState;
}

async function _tryApplyNewState(newState: Data.IHistoryState): Promise<boolean> {
   const state = History.getCurrentState();
   const newApp = getAppNameByUrl(newState.state);
   const currentApp = getAppNameByUrl(state.state);

   const result = await _checkRoutesAcceptNewState(newState);
   if (newApp === currentApp) {
      return result;
   } else {
      // Переходим без СПА, потому что сломалась синхронизация HEAD
      // при несовпадении VirtualDom inferno разрушает HEAD. Нужно
      // допатчить инферно так, чтобы под капотом библиотека НИКОГДА
      // не удаляла HEAD и HTML
      window.location.href = newState.href;
      return false;
      return new Promise<boolean>((resolve, reject) => {
         require([newApp], (appComponent) => {
            if (!appComponent) {
               _handleAppRequireError(
                  `requirejs did not report an error, but '${newApp}' component was not loaded. ` +
                  'This could have happened because of circular dependencies or because ' +
                  'of the browser behavior. Starting default redirect',
                  newState.href
               );
               reject(new Error('App component is not defined'));
            } else {
               const changedApp = _tryChangeApplication(newApp);
               if (!changedApp) {
                  _checkRoutesAcceptNewState(newState).then((ret) => {
                     resolve(ret);
                  });
               }
               resolve(true);
            }
         }, (err) => {
            // If the folder doesn't have /Index component, it does not
            // use new routing. Load the page manually
            _handleAppRequireError(
               `Unable to load module '${newApp}', starting default redirect`,
               newState.href
            );
            reject(err);
         });
      });
   }
}

function _checkRoutesAcceptNewState(newState: Data.IHistoryState): Promise<boolean> {
   const currentState = History.getCurrentState();
   const registeredRoutes = Data.getRegisteredRoutes();

   const promises = [];
   for (const routeId in registeredRoutes) {
      if (registeredRoutes.hasOwnProperty(routeId)) {
         const route: Data.IRegisteredRoute = registeredRoutes[routeId];
         promises.push(route.beforeUrlChangeCb(newState, currentState));
      }
   }

   // Make sure none of the registered routes responded with 'false'
   return Promise.all(promises).then((results) => results.indexOf(false) === -1);
}

function _notifyStateChanged(newState: Data.IHistoryState, oldState: Data.IHistoryState): void {
   const registeredRoutes = Data.getRegisteredRoutes();
   const registeredReferences = Data.getRegisteredReferences();

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

function _tryChangeApplication(newAppName: string): boolean {
   const core = Data.getCoreInstance();
   return core && core.changeApplicationHandler(null, newAppName);
}

function _handleAppRequireError(errMsg: string, redirectUrl: string): void {
   IoC.resolve('ILogger').log('Router/Controller', errMsg);
   if (window) {
      window.location.href = redirectUrl;
   }
}
