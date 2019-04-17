/// <amd-module name="Router/_private/Route" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!Router/_private/Route');

import * as Controller from './Controller';
import * as Data from './Data';
import * as MaskResolver from './MaskResolver';
import * as History from './History';

interface IRouteOptions extends HashMap<any> {
   content?: Function;
   mask?: string;
}

const FILTERED_OPTIONS_NAMES = [
   'content',
   'mask',
   'theme',
   '_isSeparatedOptions',
   '_logicParent',
   'readOnly'
];

class Route extends Control {
   public _template: Function = template;

   private _urlOptions: HashMap<any> = null;
   private _isResolved = false;

   public _beforeMount(cfg: IRouteOptions): void {
      this._urlOptions = {};
      this._applyNewUrl(cfg.mask, cfg);
   }

   public _afterMount(): void {
      this._register();
      this._checkUrlResolved();
   }

   public _beforeUpdate(cfg: IRouteOptions) {
      this._applyNewUrl(cfg.mask, cfg);
   }

   public _beforeUnmount() {
      this._unregister();
   }

   private _register(): void {
      Controller.addRoute(
         this,
         (newLoc, oldLoc) => {
            return this._beforeApplyNewUrl(newLoc, oldLoc);
         },
         () => {
            this._forceUpdate();
            return Promise.resolve(true);
         }
      );
   }

   private _unregister(): void {
      Controller.removeRoute(this);
   }

   private _beforeApplyNewUrl(newLoc: Data.IHistoryState, oldLoc: Data.IHistoryState): Promise<boolean> {
      let result: Promise<boolean>;

      const oldUrlOptions = this._urlOptions;
      this._urlOptions = MaskResolver.calculateUrlParams(this._options.mask, newLoc.state);
      const wasResolvedParam = this._hasResolvedParams();
      this._fillUrlOptionsFromCfg(this._options);

      if (wasResolvedParam && !this._isResolved) {
         result = this._notify('enter', [newLoc, oldLoc]);
         this._isResolved = true;
      } else if (!wasResolvedParam && this._isResolved) {
         result = this._notify('leave', [newLoc, oldLoc]);
         this._isResolved = false;
      } else {
         result = Promise.resolve(true);
      }

      if (this._didOptionsChange(this._urlOptions, oldUrlOptions)) {
         this._notify('change', [this._urlOptions, oldUrlOptions]);
      }


      return result;
   }

   private _applyNewUrl(mask: string, cfg: IRouteOptions): boolean {
      this._urlOptions = MaskResolver.calculateUrlParams(mask);
      const notUndefVal = this._hasResolvedParams();
      this._fillUrlOptionsFromCfg(cfg);
      return notUndefVal;
   }

   /**
    * return flag = resolved params from URL
    */
   private _hasResolvedParams(): boolean {
      let notUndefVal = false;
      for (let i in this._urlOptions) {
         if (this._urlOptions.hasOwnProperty(i)) {
            if (this._urlOptions[i] !== undefined) {
               notUndefVal = true;
               break;
            }
         }
      }
      return notUndefVal;
   }

   private _fillUrlOptionsFromCfg(cfg: IRouteOptions): void {
      for (let i in cfg) {
         if (
            cfg.hasOwnProperty(i) &&
            !this._isFilteredOptionName(i) &&
            !this._urlOptions.hasOwnProperty(i)
         ) {
            this._urlOptions[i] = cfg[i];
         }
      }
   }

   private _checkUrlResolved(): void {
      this._urlOptions = MaskResolver.calculateUrlParams(this._options.mask, Data.getRelativeUrl());
      const notUndefVal = this._hasResolvedParams();
      this._fillUrlOptionsFromCfg(this._options);

      const currentState = History.getCurrentState();
      let prevState = History.getPrevState();
      if (notUndefVal) {
         this._isResolved = true;
         if (!prevState) {
            prevState = {
               state: MaskResolver.calculateHref(this._options.mask, { clear: true })
            };
         }
         this._notify('enter', [currentState, prevState]);
         this._notify('change', [this._urlOptions, {}]);
      }
   }

   private _isFilteredOptionName(optionName: string): boolean {
      return FILTERED_OPTIONS_NAMES.indexOf(optionName) >= 0;
   }

   private _didOptionsChange(newOptions: HashMap<any>, oldOptions: HashMap<any>): boolean {
      let i;

      for (i in newOptions) {
         if (newOptions.hasOwnProperty(i)) {
            if (!oldOptions.hasOwnProperty(i) || newOptions[i] !== oldOptions[i]) {
               return true;
            }
         }
      }
      for (i in oldOptions) {
         if (oldOptions.hasOwnProperty(i) && !newOptions.hasOwnProperty(i)) {
            return true;
         }
      }

      return false;
   }
}

export = Route;
