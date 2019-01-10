/// <amd-module name="RouterDemo/InCode" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/InCode');

class InCode extends Control {
   public _template: Function = template;
}

export = InCode;
