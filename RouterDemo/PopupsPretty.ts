/// <amd-module name="RouterDemo/PopupsPretty" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/PopupsPretty');

class PopupsPretty extends Control {
   public _template: Function = template;

   private _isPopupDisplayed = false;

   _displayPopup() {
      this._isPopupDisplayed = true;
   }

   _hidePopup() {
      this._isPopupDisplayed = false;
      setTimeout(() => {
         this._notify('routerUpdated', ['/RouterDemo/page/PopupsPretty', '/RouterDemo/page/PopupsPretty'], { bubbling: true });
      }, 0);
   }
}

export = PopupsPretty;
