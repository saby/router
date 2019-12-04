import Control = require('Core/Control');
import template = require('wml!RouterDemo/resources/SampleOpener');

export default class SampleOpener extends Control {
    _template: Function = template;

    private _selfId: string;

    protected _beforeMount(): void {
        this._selfId = this._generateRandomId();
    }

    open(popupParams: Record<string, unknown>): void {
        this._notify(
            'popupManagerOpen',
            [{
                openerId: this._selfId,
                template: popupParams.template,
                closeHandler: this._closeHandler.bind(this),
                config: popupParams
            }],
            { bubbling: true }
        );
    }

    close(): void {
        this._notify(
            'popupManagerClose',
            [{ openerId: this._selfId }],
            { bubbling: true }
        );
    }

    private _closeHandler(): void {
        this._notify('close');
    }

    private _generateRandomId(): string {
        return Math.random().toString(36).substring(7);
    }
}
