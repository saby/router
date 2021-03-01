import {Control, TemplateFunction} from 'UI/Base';
import {getPageConfigSPA, IOptions} from './DataGetter';
import * as template from 'wml!RouterDemoNew/PageController';

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
