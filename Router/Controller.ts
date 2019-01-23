/// <amd-module name="Router/Controller" />

// @ts-ignore
import * as IoC from 'Core/IoC';

import Data, { IHistoryState, TStateChangeFunction, IRegisteredRoute } from 'Router/Data';

import { getAppNameByUrl } from 'Router/MaskResolver';
import * as History from 'Router/History';
import * as UrlRewriter from 'Router/UrlRewriter';

let isNavigating = false;

_initializeController();

export function navigate(newState: IHistoryState, callback?: Function, errback?: Function): void {
   const rewrittenNewUrl = UrlRewriter.get(newState.state);
   const prettyUrl = newState.href || newState.state;
   const currentState = History.getCurrentState();

   if (currentState.state === rewrittenNewUrl || isNavigating) {
      return;
   }
   const rewrittenNewState: IHistoryState = {
      state: rewrittenNewUrl,
      href: prettyUrl
   };

   isNavigating = true;
   _tryApplyNewState(rewrittenNewState).then(
      accept => {
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
      err => {
         isNavigating = false;
         errback && errback(err);
      }
   );
}

export function addRoute(route, beforeUrlChangeCb: TStateChangeFunction, afterUrlChangeCb: TStateChangeFunction): void {
   Data.registeredRoutes[route.getInstanceId()] = {
      beforeUrlChangeCb,
      afterUrlChangeCb
   };
}

export function removeRoute(route): void {
   delete Data.registeredRoutes[route.getInstanceId()];
}

export function addReference(reference, afterUrlChangeCb: TStateChangeFunction): void {
   Data.registeredReferences[reference.getInstanceId()] = {
      afterUrlChangeCb
   };
}

export function removeReference(reference): void {
   delete Data.registeredReferences[reference.getInstanceId()];
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
               event.state || prevState ? Data.relativeUrl : Data.visibleRelativeUrl
            );
            navigate(navigateToState, () => History.back());
         } else {
            // going forward
            const nextState = History.getNextState();
            const navigateToState = _getNavigationState(nextState, event.state, Data.relativeUrl);
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

function _getNavigationState(localState: IHistoryState, windowState: IHistoryState, currentUrl: string): IHistoryState {
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

function _tryApplyNewState(newState: IHistoryState): Promise<boolean> {
   const state = History.getCurrentState();
   const newApp = getAppNameByUrl(newState.state);
   const currentApp = getAppNameByUrl(state.state);

   return _checkRoutesAcceptNewState(newState).then(result => {
      if (newApp === currentApp) {
         return result;
      } else {
         return new Promise<boolean>((resolve, reject) => {
            require([newApp], appComponent => {
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
                     _checkRoutesAcceptNewState(newState).then(ret => {
                        resolve(ret);
                     });
                  }
                  resolve(true);
               }
            }, err => {
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
   });
}

function _checkRoutesAcceptNewState(newState: IHistoryState): Promise<boolean> {
   const currentState = History.getCurrentState();
   const registeredRoutes = Data.registeredRoutes;

   const promises = [];
   for (let routeId in registeredRoutes) {
      if (registeredRoutes.hasOwnProperty(routeId)) {
         const route: IRegisteredRoute = registeredRoutes[routeId];
         promises.push(route.beforeUrlChangeCb(newState, currentState));
      }
   }

   // Make sure none of the registered routes responded with 'false'
   return Promise.all(promises).then(results => results.indexOf(false) === -1);
}

function _notifyStateChanged(newState: IHistoryState, oldState: IHistoryState): void {
   const registeredRoutes = Data.registeredRoutes;
   const registeredReferences = Data.registeredReferences;

   for (let routeId in registeredRoutes) {
      if (registeredRoutes.hasOwnProperty(routeId)) {
         registeredRoutes[routeId].afterUrlChangeCb(newState, oldState);
      }
   }

   for (let referenceId in registeredReferences) {
      if (registeredReferences.hasOwnProperty(referenceId)) {
         registeredReferences[referenceId].afterUrlChangeCb(newState, oldState);
      }
   }
}

function _tryChangeApplication(newAppName: string): boolean {
   const core = Data.coreInstance;
   return core && core.changeApplicationHandler(null, newAppName);
}

function _handleAppRequireError(errMsg: string, redirectUrl: string): void {
   IoC.resolve('ILogger').log('Router/Controller', errMsg);
   if (window) {
      window.location.href = redirectUrl;
   }
}
