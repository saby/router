/// <amd-module name="RouterDemo/Popups" />
/**
 * @author Санников К.А.
 */

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Popups');
// @ts-ignore
import { Controller, Data } from 'Router/router';

/**
 * @deprecated
 * Пример открытия и закрытия всплывающих сообщений, основанный на изменении URL,
 * с использованием событий {@link Router.router:Route#enter} и {@link Router.router:Route#leave}
 */

class Popups extends Control {
   _template: Function = template;

   protected _isPopupDisplayed: boolean = false;

   _displayPopup(): void {
      this._isPopupDisplayed = true;
   }

   _hidePopup(event: Event, newLoc: Data.IHistoryState): void {
      this._isPopupDisplayed = false;
      if (newLoc.state.startsWith('/RouterDemo/page/Popups/')) {
         // When the root popup closes, make sure that all the nested popups get closed by resetting the URL
         setTimeout(() => {
            Controller.navigate({ state: '/RouterDemo/page/Popups' });
         }, 10);
      }
   }
}

export = Popups;
