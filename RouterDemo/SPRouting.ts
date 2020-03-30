/// <amd-module name="RouterDemo/SPRouting" />
/**
 * @author Санников К.А.
 */

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/SPRouting');

/**
 * Пример SPA-перехода для переключения между вкладками {@link RouterDemo/resources/TabsBlock}
 * с использованием {@link Router.Route} и {@link Router.Reference}
 */
class SPRouting extends Control {
   _template: Function = template;
}

export = SPRouting;
