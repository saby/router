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

/*
 * A control that changes the URL on user click without reloading
 * the page, performs single page navigation.
 *
 * @class Router/_private/Reference
 * @extends Core/Control
 * @control
 * @public
 */
/**
 * Компонент-ссылка, изменяет URL-адрес при клике пользователя
 * без перезагрузки страницы.
 *
 * @class Router/_private/Reference
 * @extends Core/Control
 * @control
 * @public
 */
class Reference extends Control {
    /*
     * @name Router/_private/Reference#state
     * @cfg {String} A mask that specifies which part of the actual URL should be changed
     * @remark
     * Refer to documentation <a href="https://github.com/saby/Router#using-reference-to-change-urls">for
     * detailed description</a>.
     */
    /**
     * @name Router/_private/Reference#state
     * @cfg {String} маска, определяющая как должен быть изменен действительный текущий адрес
     * @remark
     * Подробное описание <a href="https://github.com/saby/Router#using-reference-to-change-urls">приведено
     * в документации</a>.
     */

    /*
     * @name Router/_private/Reference#href
     * @cfg {String} A mask that specified which part of the "pretty" (user friendly) URL should be changed
     * @remark
     * Refer to documentation <a href="https://github.com/saby/Router#specifying-a-pretty-url">for
     * detailed description</a>.
     */
    /**
     * @name Router/_private/Reference#href
     * @cfg {String} маска, определяющая как должен быть изменен "красивый" адрес
     * (отображающийся в адресной строке браузера)
     * @remark
     * Подробное описание <a href="https://github.com/saby/Router#specifying-a-pretty-url">приведено
     * в документации</a>.
     */

    /*
     * @name Router/_private/Reference#clear
     * @cfg {Boolean} Specified if the part of the URL captured by the mask should be removed instead of being changed
     * @default False
     */
    /**
     * @name Router/_private/Reference#clear
     * @cfg {Boolean} должна ли часть адреса, соответствующая переданной маске, быть удалена (вместо
     * изменения) при клике на Reference
     * @default False
     */

    /*
     * @name Router/_private/Reference#content
     * @cfg {Content} Template for the displayed content.
     */
    /**
     * @name Router/_private/Reference#content
     * @cfg {Content} шаблон отображаемого содержимого
     */

    /*
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
    /**
     * @name Router/_private/Reference#handleClick
     * @cfg {Boolean} должен ли Reference обрабатывать клик (переходом на вычисленный URL)
     * @default True
     * @remark
     * Эту опцию можно установить в false, если вы хотите использовать Reference только для вычисления URL,
     * но не для выполнения single-page перехода
     * @example
     * <pre>
     *    <Router.router:Reference state="doc/:id" id="{{ myId }}" handleClick="{{ false }}">
     *       <p>Share this URL: {{ content.href }}</p>
     *    </Router.router:Reference>
     * </pre>
     * Клик на `p` не приведет к срабатыванию перехода
     */

    /*
     * @event Router/_private/Reference#navigate Fires when user clicks the Reference before navigating to
     * the new state
     * @param {IHistoryState} newState state Reference is navigating to
     * @remark
     * This event can be used to perform some actions before Reference navigates to a new state.
     * The history state passed as parameter can be mutated to change the navigation destination.
     * You can return **false** from the event handler to prevent navigation.
     */
    /**
     * @event Router/_private/Reference#navigate Инициируется после клика пользователя на Reference,
     * перед выполнением перехода в новое состояние
     * @param {IHistoryState} newState состояние, в которое Reference совершает переход
     * @remark
     * В обработчике события navigate можно выполнить действия перед переходом в новое состояние.
     * Состояние, переданное в качестве параметра события, может быть изменено, чтобы изменить
     * результат перехода.
     * Из обработчика события можно вернуть **false**, чтобы предотвратить переход.
     */

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
            const navigateTo: IHistoryState = {
                state: this._state,
                href: this._href
            };

            e.preventDefault();
            // navigate event can be handled by the user to prevent the
            // standard single page navigation
            if (this._notify('navigate', [navigateTo]) !== false) {
                this._changeUrlState(navigateTo);
            }
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
