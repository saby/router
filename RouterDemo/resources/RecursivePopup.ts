/// <amd-module name="RouterDemo/resources/RecursivePopup" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/resources/RecursivePopup');

import 'css!RouterDemo/resources/RecursivePopup';

interface IRecursivePopupOptions {
   displayDepth?: number;
}

class RecursivePopup extends Control {
   public _template: Function = template;
   private _isPopupDisplayed = false;
   private _topCoordinate = 80;

   private _returnPrettyUrl: string;
   private _returnUrl: string;

   _beforeMount(cfg: IRecursivePopupOptions) {
      this._topCoordinate = 80 + cfg.displayDepth * 50;
   }

   _displayPopup(event, newLocation, oldLocation) {
      if (!this._isPopupDisplayed) {
         this._isPopupDisplayed = true;

         this._returnUrl = oldLocation.url;
         this._returnPrettyUrl = oldLocation.prettyUrl;
      }
   }

   _hidePopup() {
      if (this._isPopupDisplayed) {
         this._isPopupDisplayed = false;
         setTimeout(() => {
            this._notify('routerUpdated', [this._returnUrl, this._returnPrettyUrl], { bubbling: true });
         }, 0);
      }
   }
}

export = RecursivePopup;
