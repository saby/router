import { Control } from 'UI/Base';
import { TemplateFunction } from 'UICommon/Base';
import template = require('wml!RouterTest/resources/Index');


export default class extends Control {
    _template: TemplateFunction = template;
}

export function getDataToRender(url: string): Promise<{}> {
    return Promise.resolve({url});
}