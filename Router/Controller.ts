/// <amd-module name="Router/Controller" />

import Control from 'Core/Control';

// @ts-ignore
import template = require('wml!Router/Controller');
// @ts-ignore
import registrar = require('Controls/Event/Registrar');
import UrlRewriter from 'Router/UrlRewriter';
import Router from 'Router/Route';
import History from 'Router/History';
import Link from 'Router/Link';
import RouterHelper from 'Router/Helper';

function getStateForNavigate(localState: any, historyState: any, currentUrl: string): any {
   if (!localState) {
      if (historyState && historyState.url && historyState.prettyUrl) {
         return historyState;
      } else {
         return {
            url: currentUrl,
            prettyUrl: currentUrl
         };
      }
   }
   return localState;
}

export default class Controller extends Control {
   private _registrar: registrar = null;
   private _registrarLink: registrar = null;
   private _currentRoute;
   private _registrarUpdate: registrar = null;
   private _navigateProcessed: boolean = false;
   public _template: Function = template;

   constructor(cfg: object) {
      super(cfg);
      this._currentRoute = 0;

      /*Controller doesn't work on server*/
      if (typeof window !== 'undefined') {
         this._registrar = new registrar();
         this._registrarUpdate = new registrar();
         this._registrarLink = new registrar();

         let skipped = false;
         window.onpopstate = (event: any) => {
            if (skipped) {
               skipped = false;
               return;
            }
            const currentState = History.getCurrentState();

            if (!event.state || event.state.id < currentState.id) {
               //back
               const prevState = History.getPrevState();
               const stateForNavigate = getStateForNavigate(prevState, event.state, RouterHelper.getRelativeUrl());
               this.navigate(event, stateForNavigate.url, stateForNavigate.prettyUrl,
                  () => {
                     History.back();
                  },
                  () => {
                     skipped = true;
                     history.forward();
                  });
            } else {
               //forward
               const nextState = History.getNextState();
               const stateForNavigate = getStateForNavigate(nextState, event.state, RouterHelper.getRelativeUrl());
               this.navigate(event, stateForNavigate.url, stateForNavigate.prettyUrl,
                  () => {
                     History.forward();
                  },
                  () => {
                     skipped = true;
                     history.back();
                  });
            }

         };
      }
   }

   public applyUrl(): void {
      this._registrarUpdate.startAsync();
      this._registrarLink.startAsync();
   }

   public startAsyncUpdate(newUrl: string, newPrettyUrl: string): Promise<any> {
      const state = History.getCurrentState();
      return this._registrar.startAsync({url: newUrl, prettyUrl: newPrettyUrl},
         {url: state.url, prettyUrl: state.prettyUrl}).then((values) => (values.find((value) => {return value === false; }) !== false));
   }

   public beforeApplyUrl(newUrl: string, newPrettyUrl: string): Promise<any> {
      const state = History.getCurrentState();
      const newApp = RouterHelper.getAppNameByUrl(newUrl);
      const currentApp = RouterHelper.getAppNameByUrl(state.url);

      return this.startAsyncUpdate(newUrl, newPrettyUrl).then((result) => {
         if (newApp === currentApp) {
            return result;
         } else {
            return new Promise((resolve) => {
               require([newApp], () => {
                  const changed = this._notify('changeApplication', [newApp], {bubbling: true});
                  if (!changed) {
                     this.startAsyncUpdate(newUrl, newPrettyUrl).then((ret) => {
                        resolve(ret);
                     });
                  }
                  resolve(true);
               });
            });
         }
      });
   }
   //co.navigate({}, '(.*)asda=:cmp([^&]*)(&)?(.*)?', {cmp:'asdasdasd123'})
   //co.navigate({}, '(.*)/edo/:idDoc([^/?]*)(.*)?', {idDoc:'8985'})
   //co.navigate({}, '/app/:razd/:idDoc([^/?]*)(.*)?', {razd: 'sda', idDoc:'12315'})

   public navigate(event: object, newUrl: string, newPrettyUrl: string, callback: any, errback: any): void {

      const prettyUrl = newPrettyUrl || UrlRewriter.getPrettyUrl(newUrl);
      const currentState = History.getCurrentState();

      if (currentState.url === newUrl || this._navigateProcessed) {
         return;
      }
      this._navigateProcessed = true;
      this.beforeApplyUrl(newUrl, prettyUrl).then((accept: boolean) => {
         if (accept) {
            if (callback) {
               callback();
            } else {
               History.push(newUrl, prettyUrl);
            }
            this.applyUrl();
         } else {
            errback();
         }
         this._navigateProcessed = false;
      });
   }

   public routerCreated(event: Event, inst: Router): void {
      this._registrar.register(event, inst, (newUrl, oldUrl) => {
         return inst.beforeApplyUrl(newUrl, oldUrl);
      });

      this._registrarUpdate.register(event, inst, (newUrl, oldUrl) => {
         return inst.applyNewUrl();
      });
   }

   public routerDestroyed(event: Event, inst: Router, mask: string): void {
      this._registrar.unregister(event, inst);
      this._registrarUpdate.unregister(event, inst);
   }

   public linkCreated(event: Event, inst: Link): void {
      this._registrarLink.register(event, inst, () => {
         return inst.recalcHref();
      });
   }

   public linkDestroyed(event: Event, inst: Link): void {
      this._registrarLink.unregister(event, inst);
   }
}
