/// <amd-module name="RouterDemo/Page3" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Page3');

import 'css!RouterDemo/Page3';


class Page3 extends Control {
   public _template: Function = template;
}

export = Page3;
