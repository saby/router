/// <amd-module name="Router/History" />

import * as UrlRewriter from 'Router/UrlRewriter';
import Data, { IHistoryState } from 'Router/Data';

export function getPrevState(): IHistoryState {
   return Data.history[Data.historyPosition - 1];
}
export function getCurrentState(): IHistoryState {
   return Data.history[Data.historyPosition];
}
export function getNextState(): IHistoryState {
   return Data.history[Data.historyPosition + 1];
}

export function back(): void {
   if (Data.historyPosition === 0) {
      Data.history.unshift({
         id: Data.history[0].id - 1,
         url: UrlRewriter.get(Data.visibleRelativeUrl),
         prettyUrl: Data.visibleRelativeUrl
      });
   } else {
      Data.historyPosition--;
   }
   _updateRelativeUrl();
}
export function forward(): void {
   Data.historyPosition++;
   if (Data.historyPosition === Data.history.length) {
      Data.history.push({
         id: Data.history[Data.historyPosition - 1].id + 1,
         url: UrlRewriter.get(Data.relativeUrl),
         prettyUrl: Data.relativeUrl
      });
   }
   _updateRelativeUrl();
}

export function push(newState: IHistoryState): void {
   // remove all states after the current state
   Data.history.length = Data.historyPosition + 1;

   // add new history state to the store
   newState.id = Data.history[Data.historyPosition].id + 1;
   Data.history.push(newState);
   Data.historyPosition++;

   // update the URL
   _updateRelativeUrl();
   const displayUrl = newState.prettyUrl || newState.url;
   window.history.pushState(newState, displayUrl, displayUrl);
}

function _updateRelativeUrl(): void {
   Data.relativeUrl = Data.history[Data.historyPosition].url;
}
