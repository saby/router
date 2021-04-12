/// <amd-module name="RouterDemo/Main" />
/**
 * @author Санников К.А.
 */

import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!RouterDemo/Main';

/**
 * Точка входа для демонстрации роутинга
 */

export default class Main extends Control {
   protected _template: TemplateFunction = template;
   protected _styles: string[] = ['RouterDemo/Main'];
}
