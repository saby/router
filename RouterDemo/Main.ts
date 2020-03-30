/// <amd-module name="RouterDemo/Main" />
/**
 * @author Санников К.А.
 */

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import * as template from 'wml!RouterDemo/Main';
// @ts-ignore
import * as AppInit from 'Application/Initializer';

import 'css!RouterDemo/Main';

/**
 * Точка входа для демонстрации роутинга
 */

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
