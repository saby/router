/// <amd-module name="RouterDemo/Main" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Main');
// @ts-ignore
import * as AppInit  from 'Application/Initializer';

import 'css!RouterDemo/Main';

class Main extends Control {
   public _template: Function = template;

   constructor(cfg) {
      super();

      // Initialize the Request storage that is used by Router/Data.
      // This is usually done by Application/Core, which is not used
      // in these demos
      if (!AppInit.isInit()) {
         AppInit.default(cfg);
      }
   }
}

export = Main;
