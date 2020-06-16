import * as Control from 'Core/Control';
import * as template from 'wml!RouterDemo/resources/SampleList';

import 'css!RouterDemo/resources/SampleList';

/**
 * Простой элемент списка для демонстрации навигации по элементам списка
 * Вызывает событие @event itemClick по щелчку
 */
class SampleList extends Control {
    protected _template: Function = template;

    protected _itemClickHandler(event: Event, item: any): void {
        this._notify('itemClick', [item, event], { bubbling: true });
    }
}

export = SampleList;
