import Control = require('Core/Control');
import template = require('wml!RouterDemo/PopupRouter');

class PopupRouter extends Control {
    _template: Function = template;
}

export = PopupRouter;
