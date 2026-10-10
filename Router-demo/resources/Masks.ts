/**
 * @author Мустафин Л.И.
 */

import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Router-demo/resources/Masks');

/**
 * Демонстрация query и fragment параметров в маске
 * @private
 */
class Masks extends Control {
    protected _template: TemplateFunction = template;
}

export default Masks;
