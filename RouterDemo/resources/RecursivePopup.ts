/// <amd-module name="RouterDemo/resources/RecursivePopup" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/resources/RecursivePopup');

import { navigate } from 'Router/Controller';

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

         // Store the current URL before opening the nested popup, so we
         // could return to it later
         this._returnUrl = oldLocation.url;
         this._returnPrettyUrl = oldLocation.prettyUrl;
      }
   }

   _hidePopup() {
      if (this._isPopupDisplayed) {
         this._isPopupDisplayed = false;

         // Reset the URL to the same state as it was before we opened the nested popup,
         // so that all the popups with higher depth would as well
         setTimeout(() => {
            navigate({ url: this._returnUrl, prettyUrl: this._returnPrettyUrl });
         }, 0);
      }
   }
}

export = RecursivePopup;
