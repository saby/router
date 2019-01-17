/// <amd-module name="Router/Data" />

// @ts-ignore
import Request = require('View/Request');

import UrlRewriter from 'Router/UrlRewriter';

const STORAGE_KEY = 'RouterData';

export interface IHistoryState {
   url: string;
   prettyUrl?: string;
}

interface IRouterData {
   history: IHistoryState[];
   historyPosition: number;
}

export default {
   get history(): IHistoryState[] {
      return _getField('history');
   },
   set history(value: IHistoryState[]) {
      _setField('history', value);
   },
   get historyPosition(): number {
      return _getField('historyPosition');
   },
   set historyPosition(value: number) {
      _setField('historyPosition', value);
   },
   get relativeUrl(): string {
      return _getRelativeUrl();
   }
};

function _initNewStorage(): IRouterData {
   const currentUrl = _getRelativeUrl();
   const initialHistoryState: IHistoryState = {
      url: UrlRewriter.get(currentUrl),
      prettyUrl: currentUrl
   };

   if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState(initialHistoryState, initialHistoryState.url, initialHistoryState.url);
   }

   return {
      history: [initialHistoryState],
      historyPosition: 0
   };
}

function _getStorage(): IRouterData {
   const currentRequest = Request.getCurrent();
   let storage = currentRequest.getStorage(STORAGE_KEY);
   if (!storage) {
      storage = _initNewStorage();
      currentRequest.setStorage(STORAGE_KEY, storage);
   }
   return storage;
}

function _getRelativeUrl(): string {
   const location = Request.getCurrent().location;
   return location.pathname + location.search + location.hash;
}

function _getField(fieldName: string): any {
   return _getStorage()[fieldName];
}

function _setField(fieldName: string, value: any): any {
   const storage = _getStorage();
   return storage[fieldName] = value;
}
