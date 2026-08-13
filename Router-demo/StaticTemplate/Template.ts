import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Router-demo/StaticTemplate/Template');

export default class Template extends Control {
    protected _template: TemplateFunction = template;
}
