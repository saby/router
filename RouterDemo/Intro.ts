/// <amd-module name="RouterDemo/Intro" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Intro');

class Intro extends Control {
   public _template: Function = template;
}

export = Intro;
