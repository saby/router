/// <amd-module name="Router/Route" />
import Control = require('Core/Control');
import template = require('wml!Router/Route');
import RouterHelper from './Helper';
import History from './History';

class Router extends Control {
   private _urlOptions = null;
   private _entered: boolean = false;

   pathUrlOptionsFromCfg(cfg:object): void {
      for (let i in cfg) {
         if (cfg.hasOwnProperty(i) && i !== 'mask' &&
            i !== 'content' && i !== '_logicParent') {
            this._urlOptions[i] = cfg[i];
         }
      }
   }

   /**
    * return flag = resolved params from URL
    */
   _wasResolvedParam(): boolean {
      let notUndefVal = false;
      for(let i in this._urlOptions) {
         if (this._urlOptions.hasOwnProperty(i)){
            if (this._urlOptions[i] !== undefined) {
               notUndefVal = true;
               break;
            }
         }
      }
      return notUndefVal;
   }


   _applyNewUrl(mask: string, cfg: object): boolean {
      this._urlOptions = RouterHelper.calculateUrlParams(mask, undefined);
      let notUndefVal = this._wasResolvedParam();
      this.pathUrlOptionsFromCfg(cfg);
      return notUndefVal;
   }

   beforeApplyUrl(newLoc: any, oldLoc: any): Promise {
      this._urlOptions = RouterHelper.calculateUrlParams(this._options.mask, newLoc.url);
      if (this._wasResolvedParam()) {
         this.pathUrlOptionsFromCfg(this._options);
         if (!this._entered) {
            this._entered = true;
            return this._notify('enter', [newLoc, oldLoc]);
         } else {
            return (new Promise((resolve) => {
               resolve(true);
            }));
         }
      }
      this.pathUrlOptionsFromCfg(this._options);
      if (this._entered) {
         this._entered = false;
         return this._notify('leave', [newLoc, oldLoc]);
      }
      return (new Promise((resolve)=>{resolve(true);}));
   }

   afterUpForNotify(): Promise {
      this._urlOptions = RouterHelper.calculateUrlParams(this._options.mask, RouterHelper.getRelativeUrl());
      let notUndefVal = this._wasResolvedParam();
      this.pathUrlOptionsFromCfg(this._options);

      const currentState = History.getCurrentState();
      const prevState = History.getPrevState();
      if (notUndefVal) {
         this._entered = true;
         return this._notify('enter', [currentState, prevState]);
      }
      return new Promise((resolve)=>{resolve()});
   }

   applyNewUrl(): void {
      this._forceUpdate();
   }

   _beforeMount(cfg: any): void {
      this._urlOptions = {};
      this._applyNewUrl(cfg.mask, cfg);
   }

   _afterMount(): void {
      this._notify('routerCreated', [this], { bubbling: true });
      this.afterUpForNotify();
   }

   _beforeUpdate(cfg: any) {
      this._applyNewUrl(cfg.mask, cfg);
   }

   _beforeUnmount() {
      this._notify('routerDestroyed', [this], { bubbling: true });
   }
}

Router.prototype._template = template;
export = Router;