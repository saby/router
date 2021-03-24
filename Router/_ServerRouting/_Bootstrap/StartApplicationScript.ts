/// <amd-module name="Router/_ServerRouting/_Bootstrap/StartApplicationScript" />

import { detection } from 'Env/Env';
import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Router/_ServerRouting/_Bootstrap/StartApplicationScript');

class StartApplicationScript extends Control {
   _template: TemplateFunction = template;
   private requiredModules: string[] = [];
   protected isIE: boolean = detection.isIE;

   _beforeMount(options: {requiredModules: string[]}): Promise<any> {
      if (typeof window !== 'undefined') {
         return;
      }
      this.requiredModules = options.requiredModules || [];
   }

   getDeps(): string {
      if (!this.requiredModules || !this.requiredModules.length) {
         return '[]';
      }
      return '["' + this.requiredModules.join('","') + '"]';
   }
}

export default StartApplicationScript;
