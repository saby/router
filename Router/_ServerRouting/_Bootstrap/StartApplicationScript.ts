/// <amd-module name="Router/_ServerRouting/_Bootstrap/StartApplicationScript" />

import { detection } from 'Env/Env';
import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Router/_ServerRouting/_Bootstrap/StartApplicationScript');

class StartApplicationScript extends Control {
   _template: TemplateFunction = template;
   protected requiredModules: string = '[]';
   protected isIE: boolean = detection.isIE;

   _beforeMount(options: {requiredModules: string[]}): Promise<any> {
      if (typeof window !== 'undefined') {
         return;
      }
      this.requiredModules = this.getRequiredModulesString(options.requiredModules || []);
   }

   private getRequiredModulesString(requiredModules: string[]): string {
      if (!requiredModules || !requiredModules.length) {
         return '[]';
      }
      return '["' + requiredModules.join('","') + '"]';
   }
}

export default StartApplicationScript;
