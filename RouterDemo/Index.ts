import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!RouterDemo/Index';

/**
 * Точка входа для демонстрации роутинга
 */
export default class Index extends Control {
   protected _template: TemplateFunction = template;
}
