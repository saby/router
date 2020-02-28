import Control = require('Core/Control');
import template = require('wml!RouterDemo/resources/SampleRegistry');

import SampleOpener from './SampleOpener';

import 'RouterDemo/resources/SamplePopup';
import 'css!RouterDemo/resources/SampleRegistry';

/**
 * контрол, слушающий события URL
 * закрывает и открывает всплывающие сообщения по событию
 */

export interface ISampleRegistryItem {
    id: string;
    text: string;
    status: string;
}

interface ISampleRegistryOptions {
    items: ISampleRegistryItem[];
}

interface ISampleRegistryChildren {
    logResult: HTMLTextAreaElement;
    opener: SampleOpener;
    recursiveCheck: HTMLInputElement;
}

export default class SampleRegistry extends Control {
    protected _options: ISampleRegistryOptions;
    protected _children: ISampleRegistryChildren;

    _template: Function = template;

    private _isRecursive: boolean = false;
    private _popupOpened: boolean = false;

    protected _beforeMount(): void {
        if (typeof window !== 'undefined') {
            // We save the value of `recursive` checkbox in localStorage for demo
            // purposes: we want to restore it when the page is reloaded
            this._isRecursive = JSON.parse(localStorage.getItem('recursiveCheck-checked'));
        }
    }

    private _urlAddedHandler(e: Event, param: string): void {
        this._children.logResult.value += `urlAdded fired, param: ${param}\n`;
        this._children.opener.open({
            template: 'RouterDemo/resources/SamplePopup',
            itemId: param,
            top: 150,
            left: 500,
            isRecursive: this._children.recursiveCheck.checked,
            popupDepth: 0
        });
        this._popupOpened = true;
    }

    private _urlChangedHandler(e: Event, newParam: string, oldParam: string): void {
        this._children.logResult.value += `urlChanged fired, newParam: ${newParam}, oldParam: ${oldParam}\n`;
        this._children.opener.open({
            template: 'RouterDemo/resources/SamplePopup',
            itemId: newParam,
            top: 150,
            left: 500,
            isRecursive: this._children.recursiveCheck.checked,
            popupDepth: 0
        });
    }

    private _urlRemovedHandler(e: Event): void {
        this._children.logResult.value += 'urlRemoved fired\n';
        // this._children.opener.close(); - PopupRouter calls this automatically
        this._popupOpened = false;
    }

    private _recursiveChanged(e: Event, value: boolean): void {
        this._isRecursive = this._children.recursiveCheck.checked;
        localStorage.setItem('recursiveCheck-checked', JSON.stringify(this._isRecursive));
    }
}
