/// <amd-module name="Router/_private/Reference" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!Router/_private/Reference');

import * as Controller from './Controller';
import * as MaskResolver from './MaskResolver';
import { getReverse } from './UrlRewriter';
import { IHistoryState } from './Data';

interface IReferenceOptions extends HashMap<any> {
    content?: Function;
    state?: string;
    href?: string;
    clear?: boolean;
    handleClick: boolean;
}

/**
 * A control that changes the URL on user click without reloading
 * the page, performs single page navigation.
 *
 * @class Router/_private/Reference
 * @extends Core/Control
 * @control
 * @public
 */

/**
 * @name Router/_private/Reference#state
 * @cfg {String} A mask that specifies which part of the actual URL should be changed
 * @remark
 * Refer to documentation <a href="https://github.com/saby/Router#using-reference-to-change-urls">for
 * detailed description</a>.
 */

/**
 * @name Router/_private/Reference#href
 * @cfg {String} A mask that specified which part of the "pretty" (user friendly) URL should be changed
 * @remark
 * Refer to documentation <a href="https://github.com/saby/Router#specifying-a-pretty-url">for
 * detailed description</a>.
 */

/**
 * @name Router/_private/Reference#clear
 * @cfg {Boolean} Specified if the part of the URL captured by the mask should be removed instead of being changed
 * @default False
 */

/**
 * @name Router/_private/Reference#content
 * @cfg {Content} Template for the displayed content.
 */

/**
 * @name Router/_private/Reference#handleClick
 * @cfg {Boolean} Specifies if this Reference should handle click event by navigating to the calculated URL
 * @default True
 * @remark
 * If you only want to calculate the URL based on the mask, but do not want to navigate to it on click,
 * you can set this option to false
 * @example
 * <pre>
 *    <Router.router:Reference state="doc/:id" id="{{ myId }}" handleClick="{{ false }}">
 *       <p>Share this URL: {{ content.href }}</p>
 *    </Router.router:Reference>
 * </pre>
 * Clicking on the paragraph in the example will not trigger a single page navigation
 */

class Reference extends Control {
    _template: Function = template;

    private _state: string;
    private _href: string;

    _beforeMount(cfg: IReferenceOptions): void {
        this._recalcHref(cfg);
    }

    _afterMount(): void {
        this._register();
    }

    _beforeUpdate(cfg: IReferenceOptions): void {
        this._recalcHref(cfg);
    }

    _beforeUnmount(): void {
        this._unregister();
    }

    private _register(): void {
        Controller.addReference(this, () => {
            this._recalcHref(this._options);
            this._forceUpdate();
            return Promise.resolve(true);
        });
    }

    private _unregister(): void {
        Controller.removeReference(this);
    }

    private _recalcHref(cfg: IReferenceOptions): void {
        this._state = MaskResolver.calculateHref(cfg.state, cfg);
        if (cfg.href) {
            this._href = MaskResolver.calculateHref(cfg.href, cfg);
        } else {
            this._href = getReverse(this._state);
        }
    }

    private _clickHandler(e: any): void {
        // Only respond to the 'main' button click (usually the left mouse
        // button) and ignore the rest
        if (this._options.handleClick && e.nativeEvent.button === 0) {
            e.preventDefault();
            this._changeUrlState({
                state: this._state,
                href: this._href
            });
        }
    }

    private _changeUrlState(newState: IHistoryState): void {
        Controller.navigate(newState);
    }

    static getDefaultOptions(): IReferenceOptions {
        return {
            handleClick: true
        };
    }
}

export = Reference;
