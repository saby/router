// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import * as template from 'wml!RouterDemo/Index';
import 'css!RouterDemo/Index';

/**
 * Точка входа для демонстрации роутинга
 */

export default class Index extends Control {
   _template: Function = template;
}
