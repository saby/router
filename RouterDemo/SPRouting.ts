/// <amd-module name="RouterDemo/SPRouting" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/SPRouting');

class SPRouting extends Control {
   _template: Function = template;
}

export = SPRouting;
