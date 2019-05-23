import Control = require('Core/Control');
import template = require('wml!RouterDemo/PopupRouter');
import { ISmallRegistryItem } from './resources/SmallRegistry';

class PopupRouter extends Control {
    _template: Function = template;

    private _items: ISmallRegistryItem[];

    _beforeMount(): void {
        this._items = [
            {
                id: 'firstItemId',
                text: 'Item #1',
                status: 'In work'
            },
            {
                id: 'secondItemId',
                text: 'Read this',
                status: 'Completed'
            },
            {
                id: 'thirdItemId',
                text: 'Check this',
                status: 'Waiting...'
            }
        ];
    }
}

export = PopupRouter;
