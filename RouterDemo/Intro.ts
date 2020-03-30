/// <amd-module name="RouterDemo/Intro" />
/**
 * @author Санников К.А.
 */

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!RouterDemo/Intro');

/**
 * Заглавная страница демонстрации
 */

class Intro extends Control {
   _template: Function = template;
}

export = Intro;
