/// <amd-module name="RouterDemo/resources/Masks" />
/**
 * @author Мустафин Л.И.
 */

// @ts-ignore
import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import template = require('wml!RouterDemo/resources/Masks');

/**
 * Демонстрация query и fragment параметров в маске
 */

class Masks extends Control {
   protected _template: TemplateFunction = template;
}

export default Masks;
