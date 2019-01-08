/// <amd-module name="RouterDemo/Main" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Main');

import 'css!RouterDemo/Main';

class Main extends Control {
   public _template: Function = template;
}

export = Main;
