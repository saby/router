import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!RouterDemoNew/UserModules/UserModule2';

export default class UserModule2 extends Control {
   protected _template: TemplateFunction = template;
}
