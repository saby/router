/// <amd-module name="Router/History" />

import UrlRewriter from 'Router/UrlRewriter';
import Data, { IHistoryState } from 'Router/Data';

export default {
   getPrevState(): IHistoryState {
      return Data.history[Data.historyPosition - 1];
   },
   getCurrentState(): IHistoryState {
      return Data.history[Data.historyPosition];
   },
   getNextState(): IHistoryState {
      return Data.history[Data.historyPosition + 1];
   },

   back(): void {
      if (Data.historyPosition === 0) {
         Data.history.unshift({
            url: UrlRewriter.get(Data.relativeUrl),
            prettyUrl: Data.relativeUrl
         });
      } else {
         Data.historyPosition--;
      }
   },
   forward(): void {
      Data.historyPosition++;
      if (Data.historyPosition === Data.history.length) {
         Data.history.push({
            url: UrlRewriter.get(Data.relativeUrl),
            prettyUrl: Data.relativeUrl
         });
      }
   },

   push(newState: IHistoryState): void {
      // remove all states after the current state
      Data.history.length = Data.historyPosition + 1;

      // add new history state to the store
      Data.history.push(newState);
      Data.historyPosition++;

      // update the URL
      const displayUrl = newState.prettyUrl || newState.url;
      window.history.pushState(newState, displayUrl, displayUrl);
   }
};
