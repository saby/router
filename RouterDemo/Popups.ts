/// <amd-module name="RouterDemo/Popups" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Popups');
// @ts-ignore
import { Controller, Data } from 'Router/router';

class Popups extends Control {
   _template: Function = template;

   private _isPopupDisplayed: boolean = false;

   _displayPopup(): void {
      this._isPopupDisplayed = true;
   }

   _hidePopup(event: Event, newLoc: Data.IHistoryState): void {
      this._isPopupDisplayed = false;
      if (newLoc.state.startsWith('/RouterDemo/page/Popups/')) {
         // When the root popup closes, make sure that all the nested popups get closed by resetting the URL
         setTimeout(() => {
            Controller.navigate({ state: '/RouterDemo/page/Popups' });
         }, 0);
      }
   }
}

export = Popups;
