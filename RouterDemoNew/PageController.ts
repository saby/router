import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!RouterDemoNew/PageController';
import {MaskResolver} from 'Router/router';

interface IOptions {
   templateName: string;
   templateOptions: object;
}

export default class PageController extends Control {
   protected _template: TemplateFunction = template;
   protected pageId: string;
   protected templateName: string;
   protected templateOptions: object;

   protected _beforeMount(options?: IOptions, contexts?: object, receivedState?: IOptions): Promise<IOptions|void> {
      this._setState(receivedState || options);
      if (!receivedState) {
         return Promise.resolve({templateName: this.templateName, templateOptions: this.templateOptions});
      }
   }

   protected onUrlChange(event: any, newUrlOptions: {pageId: string}): void {
      const config: IOptions = getPageConfigSPA(newUrlOptions.pageId);
      this._setState(config);
   }

   private _setState(cfg: IOptions): void {
      this.templateName = cfg.templateName;
      this.templateOptions = cfg.templateOptions;
   }
}

function getPageConfigSPA(pageId: string): IOptions {
   switch (pageId) {
      case 'UserModule2':
         return {templateName: 'RouterDemoNew/UserModules/UserModule2', templateOptions: {data: 'UserModule2 data'}};
      case 'UserModule1':
      default:
         return {templateName: 'RouterDemoNew/UserModules/UserModule1', templateOptions: {data: 'UserModule1 data'}};
   }
}

export async function getPageConfig(url: string): Promise<IOptions> {
   const data = MaskResolver.calculateUrlParams('/page/:pageId', url);
   return getPageConfigSPA(data.pageId);
}
