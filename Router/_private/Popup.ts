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

interface IOpenerControl {
    open: () => void;
    close: () => void;
}

const _private = {
    // TODO Will be removed
    // https://online.sbis.ru/opendoc.html?guid=403837db-4075-4080-8317-5a37fa71b64a
    _isOpenerControl(control: any): control is IOpenerControl {
        return typeof control.open === 'function' && typeof control.close === 'function';
    }
};

/**
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
 * @typedef {Object} IPopupRouterOptions
 * @property {String} routeName name of the route that corresponds to this opener
 * @property {Number} popupDepth depth level of the popup that is opened by this opener
 */

/**
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

class PopupRouter extends Control {
    protected _options: IPopupRouterOptions;
    protected _template: Function = template;

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
        // @ts-ignore
        const controlNodes: any[] = this._container.controlNodes;
        for (let i = 0; i < controlNodes.length; i++) {
            const node = controlNodes[i];
            if (node && node.control && _private._isOpenerControl(node.control)) {
                return node.control;
            }
        }
        return null;
    }

    /**
     * Returns the url mask used by this popup router. The same mask should
     * be passed to the Router.router:Reference that opens the popup itself
     * @function Router/_private/Popup#getUrlMask
     * @param {IPopupRouterOptions} opts options that define popup route parameters (same as control's options)
     * @returns {String} url mask used by this router
     */
    static getUrlMask(opts: IPopupRouterOptions): string {
        return `${opts.routeName}-${opts.popupDepth}/:${URL_PARAM_NAME}`;
    }

    static getDefaultOptions(): IPopupRouterOptions {
        return {
            /**
             * @name Router/_private/Popup#routeName
             * @cfg {String} name of the route that corresponds to this opener
             */
            routeName: 'popup',

            /**
             * @name Router/_private/Popup#popupDepth
             * @cfg {Number} depth level of the popup that is opened by this opener
             */
            popupDepth: 0
        };
    }
}

export = PopupRouter;
