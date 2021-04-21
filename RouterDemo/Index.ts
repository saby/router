import {Control, TemplateFunction} from 'UI/Base';
import { getConfig } from 'Application/Env';
import * as template from 'wml!RouterDemo/Index';

/**
 * Точка входа для демонстрации роутинга
 */
export default class Index extends Control {
   protected _template: TemplateFunction = template;
   /**
    * Опция для изменения шаблона демки при построении в div
    */
   protected bootstrapWrapperMode: boolean = false;

   protected _beforeMount(): void {
      this.bootstrapWrapperMode = getConfig('bootstrapWrapperMode') as boolean;
   }
}
