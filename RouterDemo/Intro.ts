/// <amd-module name="RouterDemo/Intro" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Intro');

class Intro extends Control {
   _template: Function = template;
}

export = Intro;
