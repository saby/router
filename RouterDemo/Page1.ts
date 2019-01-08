/// <amd-module name="RouterDemo/Page1" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Page1');


class Page1 extends Control {
   public _template: Function = template;
}

export = Page1;
