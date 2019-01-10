/// <amd-module name="RouterDemo/Popups" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Popups');

class Popups extends Control {
   public _template: Function = template;
}

export = Popups;
