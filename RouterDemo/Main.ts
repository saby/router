/// <amd-module name="RouterDemo/Main" />
import * as Control from 'Core/Control';
import * as template from 'wml!RouterDemo/Main';
import * as AppInit from 'Application/Initializer';

import 'css!RouterDemo/Main';

export default class Main extends Control {
   _template: Function = template;

   // TODO: Constructor of base class recieves any-type param
   // tslint:disable-next-line: no-any
   constructor(cfg: any) {
      super();
      // Initialize the Request storage that is used by Router/Data.
      // This is usually done by Application/Core, which is not used
      // in these demos
      if (!AppInit.isInit()) {
         AppInit.default(cfg);
      }
   }
}
