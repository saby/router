/// <amd-module name="RouterDemo/resources/Intro" />
/**
 * @author Мустафин Л.И.
 */

import { Control, TemplateFunction } from 'UI/Base';
import { Controller, Data } from 'Router/router';
import template = require('wml!RouterDemo/resources/Intro');

/**
 * Заглавная страница демонстрации
 */

class Intro extends Control implements Data.IRegisterableComponent {
   protected _template: TemplateFunction = template;
   protected _preventNavigateMessage: string = '';
   protected _preventNavigate: boolean = false;

   protected _beforeMount(): void {
      Controller.addRoute(this, () => {
         if (this._preventNavigate) {
            return false;
         }
         return true;
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
