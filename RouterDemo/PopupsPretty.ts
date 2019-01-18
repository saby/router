/// <amd-module name="RouterDemo/PopupsPretty" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/PopupsPretty');

import { navigate } from 'Router/Controller';

class PopupsPretty extends Control {
   public _template: Function = template;

   private _isPopupDisplayed = false;

   _displayPopup() {
      this._isPopupDisplayed = true;
   }

   _hidePopup(event, newLoc) {
      this._isPopupDisplayed = false;
      if (newLoc.url.startsWith('/RouterDemo/page/PopupsPretty/')) {
         // When the root popup closes, make sure that all the nested popups get closed by resetting the URL
         setTimeout(() => {
            navigate({ url: '/RouterDemo/page/PopupsPretty' });
         }, 0);
      }
   }
}

export = PopupsPretty;
