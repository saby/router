/// <amd-module name="RouterDemo/resources/RootRegExp" />
/**
 * @author Мустафин Л.И.
 */

// @ts-ignore
import {Control} from 'UI/Base';
// @ts-ignore
import template = require('wml!RouterDemo/resources/RootRegExp');

/**
 * Демонстрация регулярного выражения в router.json
 */

class RootRegExp extends Control {
   _template: Function = template;
   protected _docId: string = '';

   protected _beforeMount(options: {docId: string}): void {
      this._docId = options.docId;
   }

}

export = RootRegExp;
