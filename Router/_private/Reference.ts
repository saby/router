/// <amd-module name="Router/_private/Reference" />

import { Control, TemplateFunction } from 'UI/Base';
// @ts-ignore
import template = require('wml!Router/_private/Reference');

import * as Controller from './Controller';
import * as MaskResolver from './MaskResolver';
import { getReverse } from './UrlRewriter';
import { IHistoryState, ISyntheticClickEvent } from './Data';
import { IRegisterableComponent } from 'Router/_private/Data';

interface IReferenceOptions extends Record<string, unknown> {
    content?: Function;
    state?: string;
    href?: string;
    clear?: boolean;
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
 * Компонент, вычисляющий новый URL-адрес по заданной маске и указанным параметрам.
 * Вычисленный адрес передается внутрь компонента под именем href.
 * При клике на Reference совершается переход по выбранному адресу без перезагрузки страницы.
 *
 * <a href="https://github.com/saby/Router#using-reference-to-change-urls">Статья о компоненте</a>
 *
 * @example
 * Обычно Router.router:Reference используется в сочетании с элементом ссылки `a`, так как
 * это позволяет пользователю видеть адрес перед кликом на ссылку в браузере, и открывать
 * ссылку в отдельной вкладке.
 *
 * <pre>
 * <Router.router:Reference state="destination/:country" country="Italy">
 *    <a href="{{ content.href }}">Go to Italy</a>
 * </Router.router:Reference>
 * </pre>
 *
 * Текущий адрес: "/book" -> После клика: "/book/destination/Italy"
 * Текущий адрес: "/book/destination/Russia" -> После перехода: "/book/destination/Italy"
 * Текущий адрес: "/book/destination/0/day/Tue?price=mid" -> После перехода: "/book/destination/Italy/day/Tue?price=mid"
 * Текущий адрес: "/book/all" -> После перехода: "/book/all/destination/Italy"
 *
 * @class Router/_private/Reference
 * @extends Core/Control
 * @control
 * @public
 * @author Санников К.А.
 */
class Reference extends Control implements IRegisterableComponent {
    /*
     * @name Router/_private/Reference#state
     * @cfg {String} A mask that specifies which part of the actual URL should be changed
     * @remark
     * Refer to documentation <a href="https://github.com/saby/Router#using-reference-to-change-urls">for
     * detailed description</a>.
     */
    /**
     * @name Router/_private/Reference#state
     * @cfg {String} Маска, определяющая как должен быть изменен текущий адрес при переходе по ссылке.
     * @remark
     * В маске указывается та часть адреса, которая должне быть изменена при переходе по ссылке. Значение
     * для каждого placeholder'a также должно быть передано в Reference в качестве опции (см. пример).
     *
     * Опция state поддерживает те же типы масок, что и Router.router:Route. Более подробно о видах масок
     * можно <a href="https://github.com/saby/Router#mask-types">прочитать в статье</a>.
     *
     * Если маска в текущем адресе отсутствует, URL-адрес при переходе будет не изменен, а дополнен этой
     * маской с соответствующим значением.
     * Если вместо значений параметров передана опция `clear="{{ true }}"`, вместо изменения или дополнения
     * URL-адреса по маске, часть адреса, совпадающая с маской, будет удалена из URL.
     * @see Router/_private/Reference#clear
     * @see Router/_private/Reference#href
     * @example
     * <pre>
     * <Router.router:Reference state="destination/:country" country="Italy">
     *    <a href="{{ content.href }}">Go to Italy</a>
     * </Router.router:Reference>
     * </pre>
     *
     * Текущий адрес: "/book" -> После перехода: "/book/destination/Italy"
     * Текущий адрес: "/book/destination/Russia" -> После: "/book/destination/Italy"
     * Текущий адрес: "/book/destination/USA/day/Tue?price=mid" -> После: "/book/destination/Italy/day/Tue?price=mid"
     * Текущий адрес: "/book/all" -> После: "/book/all/destination/Italy"
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
     * @cfg {String} Маска, определяющая как должен быть изменен "красивый" адрес при переходе по ссылке.
     * @see Router/_private/Reference#state
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
     * Опция href поддерживает те же виды масок и параметров, как и опция state.
     */

    /*
     * @name Router/_private/Reference#clear
     * @cfg {Boolean} Specified if the part of the URL captured by the mask should be removed instead of being changed
     * @default False
     */
    /**
     * @name Router/_private/Reference#clear
     * @cfg {Boolean} Определяет, нужно ли удалить часть адреса, соответствующую маскам (state и href).
     * Если эта опция не установлена, часть адреса будет изменена, а не удалена.
     * @default False
     * @remark
     * При установленной опции clear, при переходе по Reference, часть адреса соответствующая маскам
     * будет удалена, вместо изменения.
     * @example
     * <pre>
     * <Router.router:Reference state="type/:regType" clear="{{true}}">
     *    <a href="{{ content.href }}">Change registration type</a>
     * </Router.router:Reference>
     * </pre>
     * Текущий адрес: "/signup/type/company" -> После перехода: "/signup"
     * Текущий адрес: "/signup" -> После перехода: "/signup"
     * Текущий адрес: "/signup/type/individual/oauth?ref=email" -> После перехода: "/signup/oauth?ref=email"
     */

    /*
     * @name Router/_private/Reference#content
     * @cfg {Content} Template for the displayed content.
     */
    /**
     * @name Router/_private/Reference#content
     * @cfg {Content} Шаблон отображаемого содержимого.
     */

    /*
     * @event Router/_private/Reference#navigate Fires when user clicks the Reference before navigating to
     * the new state
     * @param {IHistoryState} newState state Reference is navigating to
     * @param {SyntheticEvent} syntheticClickEvent the click event object that caused the navigation
     * @remark
     * This event can be used to perform some actions before Reference navigates to a new state.
     * The history state passed as parameter can be mutated to change the navigation destination.
     * You can return **false** from the event handler to prevent navigation.
     */
    /**
     * @event Router/_private/Reference#navigate Срабатывает при клике на Reference, перед совершением перехода
     * @param {IHistoryState} newState Состояние, в которое Reference совершает переход
     * @param {SyntheticEvent} syntheticClickEvent Объект события клика, который привел к совершению перехода
     * @remark
     * В обработчике события navigate можно выполнить действия перед переходом в новое состояние.
     * Состояние, переданное в качестве параметра события, может быть изменено, чтобы изменить
     * результат перехода.
     * Из обработчика события можно вернуть **false**, чтобы предотвратить переход.
     */

    _template: TemplateFunction = template;

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
            cfg.replace = true;
            this._href = MaskResolver.calculateHref(cfg.href, cfg);
        } else {
            this._href = getReverse(this._state);
        }
    }

    protected _clickHandler(e: ISyntheticClickEvent): void {
        // Only respond to the 'main' button click (usually the left mouse
        // button) and ignore the rest
        if (e.nativeEvent.button === 0) {
            const navigateTo: IHistoryState = {
                state: this._state,
                href: this._href
            };

            e.preventDefault();

            // Tag the event as handled by Router.router:Reference, useful
            // for checks in other routing components
            e.routerReferenceNavigation = true;

            // navigate event can be handled by the user to prevent the
            // standard single page navigation
            if (this._notify('navigate', [navigateTo, e]) !== false) {
                this._changeUrlState(navigateTo);
            }
        }
    }

    private _changeUrlState(newState: IHistoryState): void {
        Controller.navigate(newState);
    }
}

export = Reference;
