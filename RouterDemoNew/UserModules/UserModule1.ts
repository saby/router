import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!RouterDemoNew/UserModules/UserModule1';

export default class UserModule1 extends Control {
   protected _template: TemplateFunction = template;
}
