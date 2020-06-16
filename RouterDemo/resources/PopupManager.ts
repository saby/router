import Control = require('Core/Control');
import template = require('wml!RouterDemo/resources/PopupManager');

import 'css!RouterDemo/resources/PopupManager';

/**
 * Менеджер всплывающих окон
 */
interface IPopupConfig {
    openerId: string;
    template: string;
    closeHandler?: Function;
    config?: Record<string, unknown>;
}

export default class PopupManager extends Control {
    _template: Function = template;

    protected _items: any;
    protected _registeredItems: string[];

    protected _beforeMount(): void {
        this._items = {
            _version: 0
        };
        this._registeredItems = [];
    }

    protected _beforeUnmount(): void {
        this._items = null;
    }

    protected _requestedOpen(e: Event, cfg: IPopupConfig): void {
        console.log(cfg);
        this._items[cfg.openerId] = cfg;
        if (!this._registeredItems.includes(cfg.openerId)) {
            this._registeredItems.push(cfg.openerId);
        }
        this._items._version++;
    }

    protected _requestedClose(e: Event, cfg: { openerId: string }): void {
        console.log(cfg);
        delete this._items[cfg.openerId];
        this._registeredItems.splice(this._registeredItems.indexOf(cfg.openerId), 1);
        this._items._version++;
    }

    protected _userClosed(e: Event, openerId: string): void {
        this._items[openerId].closeHandler();
    }
}
