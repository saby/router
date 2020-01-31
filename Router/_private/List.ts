/// <amd-module name="Router/_private/List" />


import * as Control from 'Core/Control';
import * as template from 'wml!Router/_private/List';

import { calculateHref } from './MaskResolver';
import { navigate } from './Controller';
import { IHistoryState, ISyntheticClickEvent } from './Data';

import { Record } from 'Types/entity';

export interface IListRouterOptions {
    state: string;
    href?: string;
    itemKeyProperty: string;
}

/*
 * A routing wrapper for list controls. Handles itemClick event and changes
 * the current URL based on the passed masks and item's key property name.
 *
 * @example
 * Router.router:List handles the `itemClick` event on the inner control, calculates the
 * new url based on the `state` and `href` (optional) options, replacing the `:id` placeholder with
 * the value of `itemKeyProperty` extracted from the clicked item's record.
 *
 * <pre>
 * <Router.router:List state="cat/:id" itemKeyProperty="CatName">
 *    <Controls.list:View
 *       source="{{ _catsSource }}"
 *       keyProperty="CatId" />
 * </Router.router:List>
 * </pre>
 *
 * When user clicks an item in the list, itemClick event is fired and Router.router:List updates
 * the current url to have `cat/<clicked item's CatName property>`.
 *
 * Example:
 * Starting url = `/catList`
 * User clicks on the item `{ CatId: 2, CatName: "Max" }` -> url changes to `/catList/cat/Max`
 * User clicks on the item `{ CatId: 5, CatName: "Lily" }` -> url changes to `/catList/cat/Lily`
 *
 * Router.router:List can be used together with Router.router:Reference in the list's item template.
 * It detects if Reference was clicked and does not handle itemClick itself.
 *
 * @class Router/_private/List
 * @extends Core/Control
 * @control
 * @public
 */
/**
 * Контрол для роутинга в списках, оборачивается вокруг списковых контролов, обрабатывает
 * их событие itemClick и изменяет текущий URL на основе переданных масок и значения ключевого
 * свойства выбранной пользователем записи.
 *
 * @example
 * Router.router:List обрабатывает событие `itemClick` обернутого контрола, при клике
 * вычисляет новый URL на основе опций-масок `state` и `href` (необязательно), заменяя
 * в них параметр `:id` на значение, извлеченное из рекорда кликнутой записи, хранящееся
 * в поле с названием, переданным в опции `itemKeyProperty`.
 *
 * <pre>
 * <Router.router:List state="cat/:id" itemKeyProperty="CatName">
 *    <Controls.list:View
 *       source="{{ _catsSource }}"
 *       keyProperty="CatId" />
 * </Router.router:List>
 * </pre>
 *
 * При клике пользователя на элемент списка, срабатывает событие `itemClick` и Router.router:List
 * добавляет к URL (или обновляет существующую) часть вида `cat/<значение свойства CatName выбранной записи>`
 *
 * **Пример:**
 * Текущий URL = `/catList`
 * Пользователь кликает на элемент `{ CatId: 2, CatName: "Max" }` -> URL изменяется на `/catList/cat/Max`
 * Пользователь кликает на элемент `{ CatId: 5, CatName: "Lily" }` -> URL изменяется на `/catList/cat/Lily`
 *
 * Router.router:List может использоваться совместно с Router.router:Reference в шаблонах itemTemplate
 * элементов списка. В таком случае, если Router.router:List обнаруживает, что клик произошел по контролу
 * Reference, он не обрабатывает событие `itemClick` самостоятельно.
 *
 * @class Router/_private/List
 * @extends Core/Control
 * @control
 * @public
 * @author Черваков Д.В.
 */
export default class ListRouter extends Control {
    /*
     * @name Router/_private/List#state
     * @cfg {String} A mask that determines which part of the actual URL should be changed
     * @remark
     * Should contain an `:id` placeholder with will be replaced by the `itemKeyProperty` value of the clicked item.
     * Refer to documentation <a href="https://github.com/saby/Router#using-reference-to-change-urls">for
     * detailed description</a>.
     */
    /**
     * @name Router/_private/List#state
     * @cfg {String} Маска, определяющая изменение текущего адреса при клике на элемент списка
     * @remark
     * В маске указывается та часть адреса, которая должна быть изменена при клике на элемент списка. При этом
     * она должна содержать в себе параметр `:id`, который при переходе будет заменен на значение поля с названием
     * `itemKeyProperty` из рекорда кликнутого элемента.
     *
     * Опция state поддерживает те же типы масок, что и Router.router:Route. Более подробно о существующих типах масок
     * можно <a href="https://github.com/saby/Router#mask-types">прочитать в статье</a>.
     *
     * Если маска в текущем адресе отсутствует, URL-адрес при переходе будет не изменен, а дополнен
     * маской с соответствующим значением.
     * @see Router/_private/List#href
     * @see Router/_private/List#itemKeyProperty
     * @example
     * <pre>
     * <Router.router:List state="cat/:id" itemKeyProperty="CatName">
     *    <Controls.list:View
     *       source="{{ _catsSource }}"
     *       keyProperty="CatId" />
     * </Router.router:List>
     * </pre>
     *
     * Текущий URL = `/catList`
     * Пользователь кликает на элемент `{ CatId: 2, CatName: "Max" }` -> URL изменяется на `/catList/cat/Max`
     * Пользователь кликает на элемент `{ CatId: 5, CatName: "Lily" }` -> URL изменяется на `/catList/cat/Lily`
     */

    /*
     * @name Router/_private/List#href
     * @cfg {String} An optional mask that determines which part of the "pretty" (user friendly) URL should be changed
     * @remark
     * Should contain an `:id` placeholder with will be replaced by the `itemKeyProperty` value of the clicked item.
     * Refer to documentation <a href="https://github.com/saby/Router#specifying-a-pretty-url">for
     * detailed description</a>.
     */
    /**
     * @name Router/_private/List#href
     * @cfg {String} Необязательная маска, определяющая изменение "красивого" адреса при клике на элемент списка
     * @remark
     * "Красивым" называется адрес, отображающийся в адресной строке браузера пользователя. Он не обязательно
     * должен соответствовать реальному адресу, с которым работает система роутинга.
     *
     * Если опция href не задана, в качестве красивого адреса будет использоваться реальный адрес, изменяемый
     * опцией state, что подходит в большинстве случаев.
     *
     * Более подробно о красивых адресах можно <a href="https://github.com/saby/Router#specifying-a-pretty-url">
     * прочитать в статье</a>.
     *
     * Опция href поддерживает те же виды масок и параметров, как и опция state. Она также должна содержать в себе
     * параметр `:id` для замены на ключевое значение из рекорда кликнутого элемента.
     * @see Router/_private/List#state
     */

    /*
     * @name Router/_private/List#itemKeyProperty
     * @cfg {String} Name of the record's field that will be used in place of the `:id` mask placeholder
     * @remark
     * Router.router:List will handle itemClick and calculate the new URL based on the passed `state` and
     * (optional) `href` options. It will extract the value with the name of `itemKeyProperty` from the
     * clicked item's record and replace the `:id` placeholder in passed masks with this value.
     */
    /**
     * @name Router/_private/List#itemKeyProperty
     * @cfg {String} Название поля рекорда, значение которого должно заменять параметр `:id` в масках
     * @remark
     * Router.router:List обрабатывает itemClick и вычисляет новый URL-адрес на основе значений опций `state`
     * и `href`. Для этого он получает из рекорда кликнутой записи поле с названием `itemKeyProperty` и заменяет
     * в масках параметр `:id` извлеченным значением.
     * @see Router/_private/List#state
     * @see Router/_private/List#href
     */

    /*
     * @event Router/_private/List#navigate Fires when user clicks the list item before navigating to
     * the new state
     * @param {IHistoryState} newState state List is navigating to
     * @param {SyntheticEvent<MouseEvent>} clickEvent original click event that fired on the item
     * @param {Record} record record of the clicked item
     * @remark
     * This event can be used to perform some actions before List navigates to a new state.
     * The history state passed as parameter can be mutated to change the navigation destination.
     * **false** can be returned from the event handler to prevent navigation.
     */
    /**
     * @event Router/_private/List#navigate Срабатывает при клике на элемент списка, перед совершением перехода
     * @param {IHistoryState} newState Состояние, в которое List совершает переход
     * @param {SyntheticEvent<MouseEvent>} clickEvent Исходное событие клика
     * @param {Record} record Record кликнутой записи
     * @remark
     * В обработчике события navigate можно выполнить действия перед переходом в новое состояние (к новому адресу).
     * Состояние, переданное в качестве параметра события, можно изменять, чтобы изменить результат перехода. Из
     * обработчика события можно вернуть **false**, чтобы предотвратить переход и изменение URL.
     */

    public _options: IListRouterOptions;
    protected _template: Function = template;

    protected _itemClickHandler(event: Event, record: Record, clickEvent?: ISyntheticClickEvent): void {
        // If Reference already handled the event, do not process
        // it here
        if (clickEvent && clickEvent.routerReferenceNavigation) {
            return;
        }

        const newState = this._calculateNewState(record);

        // Fires the same navigate event as Reference does, makes it
        // possible to prevent the navigation
        // @ts-ignore
        if (this._notify('navigate', [newState, clickEvent, record]) !== false) {
            navigate(newState);
        }
    }

    // Calculating new state for navigation based on the clicked item's record
    // and passed masks for state and href
    private _calculateNewState(record: Record): IHistoryState {
        const urlId = this._getRecordField(record, this._options.itemKeyProperty);
        const state = calculateHref(this._options.state, { id: urlId });
        const href = this._options.href ? calculateHref(this._options.href, { id: urlId }) : null;
        return { state, href };
    }

    // Getting value from the record by complex path, e. g. First/Second/Third
    private _getRecordField(record: Record, fieldPath: string): string {
        if (!record) {
            return null;
        }
        const parts = fieldPath.split('/');
        const partsCount = parts.length;
        let current: any = record;
        let i = 0;
        while (current && i < partsCount) {
            const part = parts[i];
            if (typeof current.get === 'function') {
                current = current.get(part);
            } else if (typeof current[part] !== 'undefined') {
                current = current[part];
            } else {
                current = null;
            }
            ++i;
        }
        return current;
    }
}
