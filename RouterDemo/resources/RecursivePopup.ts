/// <amd-module name="RouterDemo/resources/RecursivePopup" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/resources/RecursivePopup');
// @ts-ignore
import { Controller, Data } from 'Router/router';

import 'css!RouterDemo/resources/RecursivePopup';


/**
 * Пример контрола, для управления рекурсивным открытием всплывающих окон
 */
interface IRecursivePopupOptions {
   displayDepth?: number;
}

class RecursivePopup extends Control {
   _template: Function = template;
   private _isPopupDisplayed: boolean = false;
   private _topCoordinate: number = 80;

   private _returnPrettyUrl: string;
   private _returnUrl: string;

   _beforeMount(cfg: IRecursivePopupOptions): void {
      this._topCoordinate = 80 + cfg.displayDepth * 50;
   }

   _displayPopup(event: Event, newLocation: Data.IHistoryState, oldLocation: Data.IHistoryState): void {
      if (!this._isPopupDisplayed) {
         this._isPopupDisplayed = true;

         // Store the current URL before opening the nested popup, so we
         // could return to it later
         this._returnUrl = oldLocation.state;
         this._returnPrettyUrl = oldLocation.href;
      }
   }

   _hideSelf(): void {
      this._isPopupDisplayed = false;
      this._notify('hideSelf');
   }

   _hideNestedPopup(): void {
      if (this._isPopupDisplayed) {
         this._isPopupDisplayed = false;

         // Reset the URL to the same state as it was before we opened the nested popup,
         // so that all the popups with higher depth would as well
         setTimeout(() => {
            Controller.navigate({ state: this._returnUrl, href: this._returnPrettyUrl });
         }, 0);
      }
   }
}

export = RecursivePopup;
