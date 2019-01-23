/// <amd-module name="Router/Data" />

// @ts-ignore
import Request = require('View/Request');

import * as UrlRewriter from 'Router/UrlRewriter';

const STORAGE_KEY = 'RouterData';
const CORE_INSTANCE_KEY = 'CoreInstance';

export interface IHistoryState {
   id?: number;
   state: string;
   href?: string;
}

export type TStateChangeFunction = (newLoc: IHistoryState, oldLoc: IHistoryState) => Promise<any>;

export interface IRegisteredRoute {
   beforeUrlChangeCb: TStateChangeFunction;
   afterUrlChangeCb: TStateChangeFunction;
}

export interface IRegisteredReference {
   afterUrlChangeCb: TStateChangeFunction;
}

export interface IRouterData {
   IS_ROUTER_STORAGE: boolean;
   history: IHistoryState[];
   historyPosition: number;
   registeredRoutes: HashMap<IRegisteredRoute>;
   registeredReferences: HashMap<IRegisteredReference>;
   coreInstance?: any;
   relativeUrl: string;
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
      return _getField('relativeUrl');
   },
   get visibleRelativeUrl(): string {
      return _calculateRelativeUrl();
   },
   set relativeUrl(value: string) {
      _setField('relativeUrl', value);
   },
   get registeredRoutes(): HashMap<IRegisteredRoute> {
      return _getField('registeredRoutes');
   },
   get registeredReferences(): HashMap<IRegisteredReference> {
      return _getField('registeredReferences');
   },
   get coreInstance(): any {
      return _getCoreInstance();
   }
};

function _initNewStorage(storage: any): void {
   const currentUrl = _calculateRelativeUrl();
   const initialHistoryState: IHistoryState = {
      id: 0,
      state: UrlRewriter.get(currentUrl),
      href: currentUrl
   };

   if (typeof window !== 'undefined') {
      if (window.history.state && typeof window.history.state.id === 'number') {
         initialHistoryState.id = window.history.state.id;
      } else if (!window.history.state) {
         window.history.replaceState(initialHistoryState, initialHistoryState.state, initialHistoryState.state);
      }
   }

   const initialStorage: IRouterData = {
      IS_ROUTER_STORAGE: true,
      history: [initialHistoryState],
      historyPosition: 0,
      registeredRoutes: {},
      registeredReferences: {},
      relativeUrl: initialHistoryState.state
   };
   Object.assign(storage, initialStorage);
}

function _getStorage(): IRouterData {
   const currentRequest = Request.getCurrent();
   let storage = currentRequest.getStorage(STORAGE_KEY);
   if (!storage.IS_ROUTER_STORAGE) {
      _initNewStorage(storage);
   }
   return storage;
}

function _calculateRelativeUrl(): string {
   const location = Request.getCurrent().location;
   return location.pathname + location.search + location.hash;
}

function _getCoreInstance(): any {
   const storage = Request.getCurrent().getStorage(CORE_INSTANCE_KEY);
   return storage && storage.instance;
}

function _getField(fieldName: string): any {
   return _getStorage()[fieldName];
}

function _setField(fieldName: string, value: any): any {
   const storage = _getStorage();
   return (storage[fieldName] = value);
}
