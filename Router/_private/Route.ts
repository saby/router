/// <amd-module name="Router/_private/Route" />

import { Control, TemplateFunction } from 'UI/Base';
// @ts-ignore
import template = require('wml!Router/_private/Route');

import * as Controller from './Controller';
import * as Data from './Data';
import * as MaskResolver from './MaskResolver';
import * as History from './History';
import { IRegisterableComponent } from 'Router/_private/Data';

interface IRouteOptions extends Record<string, unknown> {
    content?: Function;
    mask?: string;
}

const FILTERED_OPTIONS_NAMES: string[] =
    ['content', 'mask', 'theme', '_isSeparatedOptions', '_logicParent', 'readOnly'];

/*
 * A control that resolves the specified mask with the current URL
 * and passes the parameters to its content.
 *
 * @class
 * @extends UI/Base:Control
 * @control
 * @public
 */
/**
 * Компонент-роутер, извлекает параметры из текущего URL по заданной
 * маске, и передает их значения своим детям.
 *
 * <a href="https://github.com/saby/Router#using-route-to-match-urls">Статья о компоненте</a>
 *
 * @example
 * <pre>
 * <Router.router:Route mask="destination/:myDestination">
 *    <p>Значение параметра: {{ content.myDestination }}</p>
 * </Router.router:Route>
 * </pre>
 *
 * @class
 * @extends UI/Base:Control
 * @control
 * @public
 * @author Мустафин Л.И.
 */
class Route extends Control implements IRegisterableComponent {
    /*
     * @typedef {Object} IHistoryState
     * @property {Number} id Numeric identifier of the current state.
     * @property {String} state The actual URL Router is working with.
     * @property {String} [href] The "pretty" URL that is being displayed to the user.
     */
    /**
     * @typedef {Object} IHistoryState
     * @property {Number} id Числовой идентификатор текущего состояния
     * @property {String} state Действительный адрес, с которым работает роутинг
     * @property {String} [href] "Красивый" адрес, который отображается пользователю
     */

    /*
     * @name Router/_private/Route#mask
     * @cfg {String} A string that contains a special placeholder that represents an arbitrary parameter in the URL.
     * @remark
     * See the <a href="https://github.com/saby/Router#mask-types">detailed description
     * of the mask option and mask types</a>.
     * @example
     * <pre>
     *    <Router.router:Route mask="my/:paramName">
     *       <p>This is the value from the URL: {{ content.paramName }}</p>
     *    </Router.router:Route>
     * </pre>
     */
    /**
     * @name Router/_private/Route#mask
     * @cfg {String} Строка, содержащая специальные placeholder'ы для параметров, начинающиеся с двоеточия.
     * Эти placeholder'ы используются для обозначения определенного параметра в URL-адресе.
     * @remark
     * Значение параметра извлекается из URL и передается внутрь Router.router:Route с именем placeholder'a.
     * При изменении значения параметра в URL-адресе, обновится сам компонент Route, и внутрь него будет передано новое
     * значение параметра.
     *
     * Маски бывают двух видов.
     *
     * Первый - обычная маска с символом `/`, например `paramName/:paramValue`. Она может содержать любое число
     * placeholder'ов, например `tour/:priceMin/:priceMax`.
     * Второй - query-маска с символом `=`, например `paramName=:paramValue`. Она может содержать только один
     * placeholder. Такая маска извлекает значение из "GET-параметров" текущего URL после знака вопроса. Например,
     * для URL-адреса `/mypurchases?filtered=true&paramName=age&greaterthan=2` приведенная выше маска излечет параметр
     * `paramValue` со значением `2`.
     *
     * Более подробно виды масок описаны <a href="https://github.com/saby/Router#mask-types">в статье о роутинге</a>.
     * @example
     * Маска: "paramName/:paramValue"
     *
     * URL: "/paramName/valueOne"        -> paramValue = "valueOne"
     * URL: "/paramName/value/Two"       -> paramValue = "value"
     * URL: "/paramName/value?num=three" -> paramValue = "value"
     * URL: "/paramName/value#Four"      -> paramValue = "value"
     */

    /*
     * @name Router/_private/Route#content
     * @cfg {Content} Template for the displayed content.
     */
    /**
     * @name Router/_private/Route#content
     * @cfg {Content} Шаблон отображаемого содержимого
     */

    /*
     * @event Router/_private/Route#enter Fires when the current URL started matching the specified mask.
     * @param {UICommon/Events:SyntheticEvent} event Event object.
     * @param {IHistoryState} newLocation Location that was navigated to.
     * @param {IHistoryState} oldLocation Location that was navigated from.
     */
    /**
     * @event Router/_private/Route#enter Срабатывает после перехода, в котором адрес начинает соответствовать маске
     * @param {UICommon/Events:SyntheticEvent} event Объект события
     * @param {IHistoryState} newLocation Cостояние, в которое был совершен переход
     * @param {IHistoryState} oldLocation Cостояние, из которого был совершен переход
     * @example
     * <pre>
     * <Router.router:Route mask="search/:query">...</Router.router:Route>
     * </pre>
     * Текущий адрес: "/home"
     * Переход по адресу: "/page/search/My+query" -> срабатывает on:enter
     */

    /*
     * @event Router/_private/Route#leave Fires when the current URL stops matching the specified mask.
     * @param {UICommon/Events:SyntheticEvent} event Event object.
     * @param {IHistoryState} newLocation Location that was navigated to.
     * @param {IHistoryState} oldLocation Location that was navigated from.
     */
    /**
     * @event Router/_private/Route#leave Срабатывает после перехода, в котором адрес перестает соответствовать маске
     * @param {UICommon/Events:SyntheticEvent} event Объект события
     * @param {IHistoryState} newLocation Состояние, в которое был совершен переход
     * @param {IHistoryState} oldLocation Состояние, из которого был совершен переход
     * @example
     * <pre>
     * <Router.router:Route mask="search/:query">...</Router.router:Route>
     * </pre>
     * Текущий адрес: "/page/search/My+query"
     * Переход по адресу: "/about" -> срабатывает on:leave
     */

    /*
     * @event Router/_private/Route#change Fires when parameters resolved with the specified mask are changed.
     * @param {UICommon/Events:SyntheticEvent} event Event object.
     * @param {Object} newParameters Resolved parameters after the navigation.
     * @param {Object} oldParameters Resolved parameters before the navigation.
     */
    /**
     * @event Router/_private/Route#change Срабатывает после перехода, в котором значение параметров маски изменилось
     * @param {UICommon/Events:SyntheticEvent} event Объект события
     * @param {Object} newParameters Значения параметров после перехода
     * @param {Object} oldParameters Значения параметров до перехода
     * @example
     * <pre>
     * <Router.router:Route mask="alert/:alertType" on:change="changeAlert()" />
     * </pre>
     * <pre>
     * Текущий адрес: "/home"
     * Переход по адресу: "/home/alert/signup" -> changeAlert(event, { alertType: 'signup' }, { alertType: undefined })
     * Переход по адресу: "/home/alert/login"  -> changeAlert(event, { alertType: 'login' }, { alertType: 'signup' })
     * Переход по адресу: "/home"              -> changeAlert(event, { alertType: undefined }, { alertType: 'login' })
     * </pre>
     */

    _template: TemplateFunction = template;

    private _urlOptions: Record<string, unknown> = null;
    private _isResolved: boolean = false;
    private _urlOptionsFields: string[] = [];

    _beforeMount(cfg: IRouteOptions): void {
        this._urlOptions = {};
        this._applyNewUrl(cfg.mask, cfg);
        if (this._isClient()) {
            this._register();
        }
    }

    _afterMount(): void {
        this._checkUrlResolved();
    }

    _beforeUpdate(cfg: IRouteOptions): void {
        this._applyNewUrl(cfg.mask, cfg);
    }

    _beforeUnmount(): void {
        this._unregister();
    }

    private _register(): void {
        Controller.addRoute(
            this as IRegisterableComponent,
            (newLoc, oldLoc) => {
                return this._beforeApplyNewUrl(newLoc, oldLoc);
            },
            () => {
                this._forceUpdate();
                return true;
            }
        );
    }

    private _unregister(): void {
        Controller.removeRoute(this);
    }

    private _beforeApplyNewUrl(newLoc: Data.IHistoryState, oldLoc: Data.IHistoryState): boolean {
        let result: boolean;

        const oldUrlOptions: Record<string, unknown> = this._urlOptions;
        this._setUrlOptions(MaskResolver.calculateUrlParams((this._options as IRouteOptions).mask, newLoc.state));
        const wasResolvedParam: boolean = this._hasResolvedParams(this._urlOptions);
        this._fillUrlOptionsFromCfg(this._options);

        if (wasResolvedParam && !this._isResolved) {
            result = (this._notify('enter', [newLoc, oldLoc]) as boolean);
            this._isResolved = true;
        } else if (!wasResolvedParam && this._isResolved) {
            result = (this._notify('leave', [newLoc, oldLoc]) as boolean);
            this._isResolved = false;
        } else {
            result = true;
        }

        if (this._didOptionsChange(this._urlOptions, oldUrlOptions)) {
            this._notify('change', [this._urlOptions, oldUrlOptions]);
        }

        return result;
    }

    private _applyNewUrl(mask: string, cfg: IRouteOptions): boolean {
        this._setUrlOptions(MaskResolver.calculateUrlParams(mask));
        const notUndefVal: boolean = this._hasResolvedParams(this._urlOptions);
        this._fillUrlOptionsFromCfg(cfg);
        return notUndefVal;
    }

    private _hasResolvedParams(urlOptions: Record<string, unknown>): boolean {
        let notUndefVal: boolean = false;
        for (const i in urlOptions) {
            if (urlOptions.hasOwnProperty(i)) {
                if (urlOptions[i] !== undefined) {
                    notUndefVal = true;
                    break;
                }
            }
        }
        return notUndefVal;
    }

    private _fillUrlOptionsFromCfg(cfg: IRouteOptions): void {
        for (const i in cfg) {
            if (cfg.hasOwnProperty(i) && !this._isFilteredOptionName(i) && !this._urlOptions.hasOwnProperty(i)) {
                this._urlOptions[i] = cfg[i];
            }
        }
    }

    private _checkUrlResolved(): void {
        const urlOptions: Record<string, unknown> =
            MaskResolver.calculateUrlParams((this._options as IRouteOptions).mask, Data.getRelativeUrl());
        const notUndefVal: boolean = this._hasResolvedParams(urlOptions);
        this._fillUrlOptionsFromCfg(this._options);

        const currentState: Data.IHistoryState = History.getCurrentState();
        let prevState: Data.IHistoryState = History.getPrevState();
        if (notUndefVal) {
            if (this._didOptionsChange(urlOptions, this._urlOptions)) {
                this._setUrlOptions(urlOptions);
            }
            this._isResolved = true;
            if (!prevState) {
                prevState = {
                    state: MaskResolver.calculateHref((this._options as IRouteOptions).mask, { clear: true })
                };
            }
            this._notify('enter', [currentState, prevState]);
            this._notify('change', [this._urlOptions, {}]);
        }
    }

    private _setUrlOptions(newUrlOptions: Record<string, unknown>): void {
        this._urlOptions = newUrlOptions;
        this._urlOptionsFields = Object.keys(newUrlOptions);
    }

    private _isFilteredOptionName(optionName: string): boolean {
        return FILTERED_OPTIONS_NAMES.indexOf(optionName) >= 0;
    }

    private _didOptionsChange(newOptions: Record<string, unknown>, oldOptions: Record<string, unknown>): boolean {
        let i: string;

        for (i in newOptions) {
            if (newOptions.hasOwnProperty(i)) {
                if (!oldOptions.hasOwnProperty(i) || newOptions[i] !== oldOptions[i]) {
                    return true;
                }
            }
        }
        for (i in oldOptions) {
            if (oldOptions.hasOwnProperty(i) &&
                    // проверка только полей опции, т.к. в старом _urlOptions есть поля типа vdomCORE, _$createdFromCode
                    // а в новом _urlOptions этих полей нет и быть не может
                    (this._urlOptionsFields.length === 0 || this._urlOptionsFields.indexOf(i) >= 0)
                    && !newOptions.hasOwnProperty(i)) {
                return true;
            }
        }

        return false;
    }

    _isClient(): boolean {
        return typeof window !== 'undefined';
    }
}

export default Route;
