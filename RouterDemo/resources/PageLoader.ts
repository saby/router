/// <amd-module name="RouterDemo/resources/PageLoader" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/resources/PageLoader');

/**
 * Загрузчик страниц, используется в {@link RouterDemo/Main}
 */

class PageLoader extends Control {
   _template: Function = template;

   private pageClassLoaded: Function = null;

   private async changePage(newPage: String): Promise<void> {
      return new Promise((resolve, reject) => {
         // @ts-ignore
         require(['RouterDemo/' + newPage], (newPageClass: Function) => {
            this.pageClassLoaded = newPageClass;
            resolve();
         });
      });
   }

   static getDefaultOptions(): any {
      return {
         pageId: 'Intro'
      };
   }

   async _beforeMount(cfg: any): Promise<void> {
      return this.changePage(cfg.pageId);
   }

   _beforeUpdate(newCfg: any): void {
      // @ts-ignore
      if (this._options.pageId !== newCfg.pageId) {
         this.changePage(newCfg.pageId).then(() => {
            // @ts-ignore
            this._forceUpdate();
         });
      }
   }
}

export = PageLoader;
