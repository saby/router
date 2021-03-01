import {Control, TemplateFunction} from 'UI/Base';
import {getPageConfig} from './DataGetter';
import * as template from 'wml!RouterDemoNew/Index';

export default class Index extends Control {
   protected _template: TemplateFunction = template;
}

/*
Тут главное, чтобы был экспортирован метод, с названием getDataToRender
function getDataToRender(url: string): {templateName: string, templateOptions: any}
Этот метод будет позван на сервисе представления для предварительной вычитки данных
 */
export { getPageConfig as getDataToRender };
