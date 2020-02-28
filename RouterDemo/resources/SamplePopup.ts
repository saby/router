import Control = require('Core/Control');
import template = require('wml!RouterDemo/resources/SamplePopup');

import SampleOpener from './SampleOpener';

/**
 * реализация всплывающего сообщения для демонстрации
 */
interface ISamplePopupOptions {
    popupDepth: number;
    isRecursive: boolean;
    left: number;
    top: number;
}

interface ISamplePopupChildren {
    opener: SampleOpener;
}

class SamplePopup extends Control {
    protected _options: ISamplePopupOptions;
    protected _children: ISamplePopupChildren;

    _template: Function = template;

    private _urlAddedOrChanged(e: Event, newParam: string): void {
        this._children.opener.open({
            template: 'RouterDemo/resources/SamplePopup',
            itemId: newParam,
            top: 150,
            left: this._options.left + 20,
            isRecursive: this._options.isRecursive,
            popupDepth: this._options.popupDepth + 1
        });
    }
}

export = SamplePopup;
