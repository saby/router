/// <amd-module name="RouterDemo/resources/Intro" />
/**
 * @author Мустафин Л.И.
 */

// @ts-ignore
import {Control, TemplateFunction} from 'UI/Base';
import { Controller, Data } from 'Router/router';
// @ts-ignore
import template = require('wml!RouterDemo/resources/Intro');

/**
 * Заглавная страница демонстрации
 */

class Intro extends Control implements Data.IRegisterableComponent {
   protected _template: TemplateFunction = template;
   protected _preventNavigateMessage: string = '';
   protected _preventNavigate: boolean = false;

   protected _beforeMount(options: {}): void {
      Controller.addRoute(this, (newState, currentState): Promise<boolean> => {
         return new Promise((resolve, reject) => {
            if (this._preventNavigate) {
               reject();
               return;
            }
            resolve(true);
         });
      });
   }

   _setPreventNavigate(): void {
      this._preventNavigate = !this._preventNavigate;
      if (!this._preventNavigate) {
         this._preventNavigateMessage = '';
      } else {
         this._preventNavigateMessage = 'SPA переходы заблокированы.';
      }
   }

   getInstanceId(): string {
      return 'page/Intro';
   }
}

export default Intro;
