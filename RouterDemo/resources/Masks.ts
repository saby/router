/// <amd-module name="RouterDemo/resources/Masks" />
/**
 * @author Мустафин Л.И.
 */

// @ts-ignore
import {Control} from 'UI/Base';
// @ts-ignore
import template = require('wml!RouterDemo/resources/Masks');

/**
 * Демонстрация query и fragment параметров в маске
 */

class Masks extends Control {
   _template: Function = template;
}

export = Masks;
