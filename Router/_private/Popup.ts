/// <amd-module name="Router/_private/Popup" />

import Control = require('Core/Control');
import template = require('wml!Router/_private/Popup');

import * as Controller from './Controller';
import * as MaskResolver from './MaskResolver';
import * as History from './History';

const URL_PARAM_NAME = 'id';

interface IPopupRouterUrlParams extends Record<string, unknown> {
    [URL_PARAM_NAME]: string;
}

interface IPopupRouterOptions extends Record<string, unknown> {
    routeName: string;
    popupDepth: number;
}

interface IOpenerControl extends Control {
    open: () => void;
    close: () => void;
}

interface IControlContainer extends HTMLElement {
    controlNodes: Array<{ control: Control }>;
}

const _private = {
    // TODO Will be removed
    // https://online.sbis.ru/opendoc.html?guid=403837db-4075-4080-8317-5a37fa71b64a
    _isOpenerControl(control: Control): control is IOpenerControl {
        return (
            typeof (control as IOpenerControl).open === 'function' &&
            typeof (control as IOpenerControl).close === 'function'
        );
    }
};

/*
 * A control that simplifies routing for popups by firing events
 * whenever the popup's url parameter is added to the url or changes
 * its value. It also automatically closes the popup when the
 * user removes popup's url part from the address (for example
 * by pressing the 'back' button)
 *
 * The mask for the popup is generated based on options that are used
 * to fill the following template:
 *
 * <pre>{{routeName}}-{{popupDepth}}/:id</pre>
 *
 * @class Router/_private/Popup
 * @extends Core/Control
 * @control
 * @public
 */
/**
 * Компонент для роутинга всплывающих окон, оборачивается вокруг компонента-opener'a
 * и стреляет события, когда в адресе появляется или изменяется часть URL, соответствующая
 * его всплывающему окну.
 *
 * Он также автоматически закрывает всплывающее окно, когда его URL-параметр удаляется
 * из адреса (например после нажатия кнопки назад в браузере).
 *
 * <a href="https://github.com/saby/Router#using-popup-to-open-and-close-popups-on-url-change">
 * Статья о компоненте
 * </a>
 *
 * @class Router/_private/Popup
 * @extends Core/Control
 * @control
 * @public
 */
class PopupRouter extends Control {
    /*
     * @typedef {Object} IPopupRouterOptions
     * @property {String} routeName name of the route that corresponds to this opener
     * @property {Number} popupDepth depth level of the popup that is opened by this opener
     */
    /**
     * @typedef {Object} IPopupRouterOptions
     * @property {String} routeName Имя попапа, соответствующего этому popup-роутеру, используется
     * в качестве первой части маски
     * @property {Number} popupDepth Уровень вложенности попапа, соответствующего этому popup-роутеру,
     * используется в качестве второй части маски
     */

    /*
     * @event Router/_private/Popup#urlAdded Fires when popup's url parameter is added to the url
     * @param {String} newParameter The value of the parameter added
     * @example
     * <pre>
     *    <Router.router:Popup routeName="doc" popupDepth="0">
     *       <Controls.popup:Sticky ... />
     *    </Router.router:Popup>
     * </pre>
     * User navigates from '/' to '/doc-0/abcdef' -> event 'urlAdded' fires with the parameter 'abcdef'
     */
    /**
     * @event Router/_private/Popup#urlAdded Срабатывает, когда к URL добавляется часть адреса, соответствующая попапу
     * @param {String} newParameter Значение добавленного параметра
     * @see Router/_private/Popup#routeName
     * @see Router/_private/Popup#popupDepth
     * @remark
     * Маска для попапов следует следующему шаблону: `{{routeName}}-{{popupDepth}}/:id`.
     * При появлении параметра в URL, который соответствует заданной маске, сработает это событие.
     * Значение параметра, захваченного placeholder'ом `:id`, будет передано в обработчик в качестве параметра.
     *
     * В обработчике этого события нужно открыть всплывающее окно с содержимым, соответствующим параметру.
     * @example
     * <pre>
     *    <Router.router:Popup routeName="doc" popupDepth="0">
     *       <Controls.popup:Sticky ... />
     *    </Router.router:Popup>
     * </pre>
     * Пользователь переходит с '/' на '/doc-0/abcdef' -> событие 'urlAdded' выстреливает с параметром 'abcdef'
     */

    /*
     * @event Router/_private/Popup#urlRemoved Fires when popup's url parameter is removed from the url
     * @example
     * <pre>
     *    <Router.router:Popup routeName="doc" popupDepth="0">
     *       <Controls.popup:Sticky ... />
     *    </Router.router:Popup>
     * </pre>
     * User navigates from '/doc-0/abcdef' to '/' -> event 'urlRemoved' fires
     */
    /**
     * @event Router/_private/Popup#urlRemoved Срабатывает, когда из URL удаляется часть адреса, соответствующая попапу
     * @see Router/_private/Popup#routeName
     * @see Router/_private/Popup#popupDepth
     * @remark
     * Маска для попапов следует следующему шаблону: `{{routeName}}-{{popupDepth}}/:id`.
     * При удаление параметра соответствующего заданной маске, из URL, сработает это событие.
     *
     * Если Router.router:Popup обернут вокруг компонента-опенера, в этот момент на нем автоматически
     * будет вызван метод `close()`, закрывать всплывающее окно вручную не нужно.
     * @example
     * <pre>
     *    <Router.router:Popup routeName="doc" popupDepth="0">
     *       <Controls.popup:Sticky ... />
     *    </Router.router:Popup>
     * </pre>
     * Пользователь переходит с '/doc-0/abcdef' на '/' -> выстреливает событие 'urlRemoved'
     */

    /*
     * @event Router/_private/Popup#urlChanged Fires when popup's url parameter is changed
     * @param {String} newParameter The new value of the parameter
     * @param {String} oldParameter The old value of the parameter
     * @example
     * <pre>
     *    <Router.router:Popup routeName="doc" popupDepth="0">
     *       <Controls.popup:Sticky ... />
     *    </Router.router:Popup>
     * </pre>
     * User navigates from '/doc-0/abcdef' to '/doc-0/ijk' -> event 'urlChanged' fires with parameters 'ijk', 'abcdef'
     */
    /**
     * @event Router/_private/Popup#urlChanged Срабатывает, когда в URL меняется часть адреса, соответствующая попапу
     * @param {String} newParameter Новое значение параметра
     * @param {String} oldParameter Старое значение параметра
     * @see Router/_private/Popup#routeName
     * @see Router/_private/Popup#popupDepth
     * @remark
     * Маска для попапов следует следующему шаблону: `{{routeName}}-{{popupDepth}}/:id`.
     * При изменении значения параметра, захваченного placeholder'ом `:id` в этом адресе, сработает
     * это событие.
     *
     * В обработчик события в качестве параметров будут переданы как старое, так и новое значение
     * параметра из URL.
     *
     * В этом обработчике нужно изменить содержимое уже открытого всплывающего окна, с учетом
     * нового значения параметра.
     * @example
     * <pre>
     *    <Router.router:Popup routeName="doc" popupDepth="0">
     *       <Controls.popup:Sticky ... />
     *    </Router.router:Popup>
     * </pre>
     * Пользователь переходит с '/doc-0/abcdef' на '/doc-0/ijk' ->
     * событие 'urlChanged' выстреливает с параметрами 'ijk', 'abcdef'
     */

    protected _options: IPopupRouterOptions;
    protected _template: Function = template;
    protected _container: IControlContainer;

    private _urlMask: string;
    private _returnHref: string;

    protected _beforeMount(opts: IPopupRouterOptions): void {
        this._urlMask = PopupRouter.getUrlMask(opts);

        const prevState = History.getCurrentState();
        this._returnHref = prevState && prevState.href;
    }

    protected _beforeUpdate(newOpts: IPopupRouterOptions): void {
        this._urlMask = PopupRouter.getUrlMask(newOpts);
    }

    private _urlChanged(event: Event, newParams: IPopupRouterUrlParams, oldParams: IPopupRouterUrlParams): void {
        const oldPopupParameter = oldParams[URL_PARAM_NAME];
        const newPopupParameter = newParams[URL_PARAM_NAME];

        if (newPopupParameter && !oldPopupParameter) {
            this._notify('urlAdded', [newPopupParameter]);
        } else if (!newPopupParameter && oldPopupParameter) {
            this._notify('urlRemoved');
            this._closePopup();
        } else {
            this._notify('urlChanged', [newPopupParameter, oldPopupParameter]);
        }
    }

    private _popupClosed(): void {
        // When the popup is closed, clear the corresponding url part from the
        // address bar
        const newUrl = MaskResolver.calculateHref(this._urlMask, { clear: true });
        Controller.navigate({ state: newUrl, href: this._returnHref });
    }

    private _closePopup(): void {
        const opener = this._getOpenerControl();
        if (opener) {
            opener.close();
        }
    }

    private _getOpenerControl(): IOpenerControl {
        // TODO Will be removed
        // https://online.sbis.ru/opendoc.html?guid=403837db-4075-4080-8317-5a37fa71b64a
        const controlNodes = this._container.controlNodes;
        for (let i = 0; i < controlNodes.length; i++) {
            const node = controlNodes[i];
            if (node && node.control && _private._isOpenerControl(node.control)) {
                return node.control;
            }
        }
        return null;
    }

    static getUrlMask(opts: IPopupRouterOptions): string {
        return `${opts.routeName}-${opts.popupDepth}/:${URL_PARAM_NAME}`;
    }

    static getDefaultOptions(): IPopupRouterOptions {
        return {
            /**
             * @name Router/_private/Popup#routeName
             * @cfg {String} Имя попапа, соответствующего этому popup-роутеру, используется
             * в качестве первой части маски
             */
            routeName: 'popup',

            /**
             * @name Router/_private/Popup#popupDepth
             * @cfg {Number} Уровень вложенности попапа, соответствующего этому popup-роутеру,
             * используется в качестве второй части маски
             */
            popupDepth: 0
        };
    }
}

export = PopupRouter;
