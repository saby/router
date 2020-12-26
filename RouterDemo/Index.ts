// @ts-ignore
import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!RouterDemo/Index';
import 'css!RouterDemo/Index';

/**
 * Точка входа для демонстрации роутинга
 */

export default class Index extends Control {
   protected _template: TemplateFunction = template;
}
