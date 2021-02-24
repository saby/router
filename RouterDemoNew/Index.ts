import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!RouterDemoNew/Index';

export default class Index extends Control {
   protected _template: TemplateFunction = template;
}
