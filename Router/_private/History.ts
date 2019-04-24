/// <amd-module name="Router/_private/History" />

import * as UrlRewriter from './UrlRewriter';
import * as Data from './Data';

/**
 * @function Router/_private/History#getPrevState
 * Get the previous history state
 * @returns {Data.IHistoryState}
 */
export function getPrevState(): Data.IHistoryState {
   return Data.getHistory()[Data.getHistoryPosition() - 1];
}
/**
 * @function Router/_private/History#getCurrentState
 * Get the current history state
 * @returns {Data.IHistoryState}
 */
export function getCurrentState(): Data.IHistoryState {
   return Data.getHistory()[Data.getHistoryPosition()];
}
/**
 * @function Router/_private/History#getNextState
 * Get the next history state
 * @returns {Data.IHistoryState}
 */
export function getNextState(): Data.IHistoryState {
   return Data.getHistory()[Data.getHistoryPosition() + 1];
}

/**
 * @function Router/_private/History#back
 * Moves the Router one step back in history
 * @remark
 * This does not affect the window.history and the address bar location,
 * only the Router's history position.
 * Use native window.history.back method to go back in history while
 * changing the address bar location
 */
export function back(): void {
   const history = Data.getHistory();
   const historyPosition = Data.getHistoryPosition();

   if (historyPosition === 0) {
      // If window has an existing state, use it instead of calculating by ourselves
      const windowHistoryState = typeof window !== 'undefined' && window.history.state;
      const currentState = windowHistoryState && windowHistoryState.state;
      const currentHref = Data.getVisibleRelativeUrl();
      history.unshift({
         id: history[0].id - 1,
         state: currentState || UrlRewriter.get(currentHref),
         href: currentHref
      });
   } else {
      Data.setHistoryPosition(historyPosition - 1);
   }

   _updateRelativeUrl();
}
/**
 * @function Router/_private/History#forward
 * Moves the Router one step forward in history
 * @remark
 * This does not affect the window.history and the address bar location,
 * only the Router's history position.
 * Use native window.history.forward method to go back in history while
 * changing the address bar location
 */
export function forward(): void {
   const history = Data.getHistory();
   const newHistoryPosition = Data.getHistoryPosition() + 1;

   Data.setHistoryPosition(newHistoryPosition);
   if (newHistoryPosition === history.length) {
      const currentUrl = Data.getRelativeUrl();
      history.push({
         id: history[newHistoryPosition - 1].id + 1,
         state: UrlRewriter.get(currentUrl),
         href: currentUrl
      });
   }

   _updateRelativeUrl();
}

/**
 * @function Router/_private/History#push
 * Moves the Router into a specified new state, pushes the changes
 * to the window.history
 * @param {Data.IHistoryState} newState new state to push
 * @remark
 * This function does not start the Route and Reference update,
 * it only pushes the state into window and Router history.
 * To change the state while updating Routes and References,
 * use Controller's **navigate** method instead
 * @see Router/_private/Controller#navigate
 */
export function push(newState: Data.IHistoryState): void {
   const history = Data.getHistory();
   const historyPosition = Data.getHistoryPosition();

   // remove all states after the current state
   history.length = historyPosition + 1;

   // add new history state to the store
   newState.id = history[historyPosition].id + 1;
   history.push(newState);
   Data.setHistoryPosition(historyPosition + 1);

   // update the URL
   _updateRelativeUrl();
   const displayUrl = newState.href || newState.state;
   window.history.pushState(newState, displayUrl, displayUrl);
}

/**
 * @function Router/_private/History#replaceState
 * Replaces the current state in Router's history with the
 * specified state
 * @param {Data.IHistoryState} newState replacement state
 * This function does not start the Route and Reference update,
 * it only replaces the state in window and Router history.
 * To change the state while updating Routes and References,
 * use Controller's **replaceState** method instead
 * @see Router/_private/Controller#replaceState
 */
export function replaceState(newState: Data.IHistoryState): void {
   const history = Data.getHistory();
   const historyPosition = Data.getHistoryPosition();

   newState.id = history[historyPosition].id;

   history[historyPosition] = newState;

   _updateRelativeUrl();
   const displayUrl = newState.href || newState.state;
   window.history.replaceState(newState, displayUrl, displayUrl);
}

function _updateRelativeUrl(): void {
   Data.setRelativeUrl(Data.getHistory()[Data.getHistoryPosition()].state);
}
