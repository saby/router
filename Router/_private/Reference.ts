import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { detection } from 'Env/Env';
import { getRootRouter, IRouter } from './Router/Router';
import { IHistoryState, IRegisterableComponent } from './DataInterfaces';
import template = require('wml!Router/_private/Reference');

interface ISyntheticMouseEvent {
    preventDefault: () => void;
    nativeEvent: MouseEvent;
    routerReferenceNavigation?: boolean;
    stopPropagation: Function;
}

interface IReferenceOptions extends IControlOptions, Record<string, unknown> {
    Router: IRouter;
    content?: Function;
    state?: string;
    href?: string;
    clear?: boolean;
}

/**
 * Компонент, вычисляющий новый URL-адрес по заданной маске и указанным параметрам.
 * Вычисленный адрес передается внутрь компонента под именем href.
 * При клике на Reference совершается переход по выбранному адресу без перезагрузки страницы.
 *
 * <a href="https://wasaby.dev/doc/platform/routing/#router-references">Статья о компоненте</a>
 *
 * @example
 * Обычно Router.router:Reference используется в сочетании с элементом ссылки `a`, так как
 * это позволяет пользователю видеть адрес перед кликом на ссылку в браузере.
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
 * @extends UI/Base:Control
 * @control
 * @public
 * @author Мустафин Л.И.
 */
class Reference
    extends Control<IReferenceOptions>
    implements IRegisterableComponent
{
    /**
     * @name Router/_private/Reference#state
     * @cfg {String} Маска, определяющая как должен быть изменен текущий адрес при переходе по ссылке.
     * @remark
     * В маске указывается та часть адреса, которая должне быть изменена при переходе по ссылке. Значение
     * для каждого placeholder'a также должно быть передано в Reference в качестве опции (см. пример).
     *
     * Опция state поддерживает те же типы масок, что и Router.router:Route. Более подробно о видах масок
     * можно <a href="https://wasaby.dev/doc/platform/routing/mask-and-syntax/">прочитать в статье</a>.
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
     *
     * Чтобы удалить параметр из URL-адреса, необходимо его добавить в маску, но не передавать для него значение
     * <pre>
     * <Router.router:Reference state="destination/:country/day/:dayName" country="Italy">
     *    <a href="{{ content.href }}">Go to Italy</a>
     * </Router.router:Reference>
     * </pre>
     *
     * Текущий адрес: "/book/destination/USA/day/Tue?price=mid" -> После: "/book/destination/Italy?price=mid"
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
     * Более подробно о красивых адресах можно <a href="https://wasaby.dev/doc/platform/routing/#beautiful-link">
     * прочитать в статье</a>.
     *
     * Опция href поддерживает те же виды масок и параметров, как и опция state.
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

    /**
     * @name Router/_private/Reference#content
     * @cfg {Content} Шаблон отображаемого содержимого.
     */

    /**
     * @name Router/_private/Reference#recalcUrlBeforeNavigate
     * @cfg {Boolean} Признак того, что нужно пересчитывать url ссылки при наведении на неё мышкой.
     * По умолчанию false.
     */

    /**
     * @name Router/_private/Reference#replace
     * @cfg {Boolean} Признак того, что необходимо полностью заменить url переданной маской.
     * По умолчанию false.
     * @example
     * <pre>
     * <Router.router:Reference state="destination/:country" country="Italy" replace={{true}}>
     *    <a href="{{ content.href }}">Go to Italy</a>
     * </Router.router:Reference>
     * </pre>
     *
     * Текущий адрес: "/some/url" -> После перехода: "/destination/Italy"
     */

    /**
     * @name Router/_private/Reference#trailingSlash
     * @cfg {Boolean}
     * @description Признак того, что необходимо учитывать слеш в конце маски. По умолчанию false.
     * @example
     * <pre>
     * <Router.router:Reference state="/destination/:country/" country="Italy" trailingSlash={{true}}>
     *    <a href="{{ content.href }}">Go to Italy</a>
     * </Router.router:Reference>
     * </pre>
     * Текущий адрес: "/some/url" -> После перехода: "/destination/Italy/"
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
    private _recalcUrlBeforeNavigate: boolean;
    private _mousoverRecalcCalled: boolean = false;

    _beforeMount(options: IReferenceOptions): void {
        this._recalcUrlBeforeNavigate = !!options.recalcUrlBeforeNavigate;
        this._recalcHref(options);
    }

    _afterMount(): void {
        this._register();
    }

    _beforeUpdate(options: IReferenceOptions): void {
        if (this._mousoverRecalcCalled) {
            this._mousoverRecalcCalled = false;
        } else {
            this._recalcHref(options);
        }
    }

    _beforeUnmount(): void {
        this._unregister();
    }

    private _register(): void {
        this._options.Router._manager.addReference(this, () => {
            this._recalcHref(this._options);
            this._forceUpdate();
            return Promise.resolve(true);
        });
    }

    private _unregister(): void {
        this._options.Router._manager.removeReference(this);
    }

    private _recalcHref(options: IReferenceOptions, currentUrl?: string): void {
        const _router = options.Router || getRootRouter(true);
        this._state = _router.maskResolver.calculateHref(
            options.state,
            options,
            currentUrl
        );
        if (options.href) {
            const url = _router.urlRewriter.getReverse(
                currentUrl || _router.url.getStateUrl()
            );
            this._href = _router.maskResolver.calculateHref(
                options.href,
                options,
                url
            );
        } else {
            this._href = _router.urlRewriter.getReverse(this._state);
        }
    }

    protected _mousedownHandler(e: ISyntheticMouseEvent): void {
        // обрабатываем только если кликнули левой кнопкой мыши
        if (e.nativeEvent.button !== 0) {
            return;
        }

        // если зажата клавиша Ctrl или это MacOs и зажата клавиша Cmd то ничего не делаем,
        // чтобы событие дошло до обработчика onClick - там нативно откроется ссылку в новой вкладке в фоне
        if (
            e.nativeEvent.ctrlKey ||
            (detection.isMacOSDesktop && e.nativeEvent.metaKey)
        ) {
            return;
        }

        const navigateTo: IHistoryState = {
            state: this._state,
            href: this._href,
        };

        // Tag the event as handled by Router.router:Reference, useful
        // for checks in other routing components
        e.routerReferenceNavigation = true;

        // navigate event can be handled by the user to prevent the
        // standard single page navigation
        if (this._notify('navigate', [navigateTo, e]) !== false) {
            this._options.Router.navigate(navigateTo);
        }
    }

    /**
     * Обработка клика по ссылке
     * просто отменим событие клика, т.к. переход на новый url происходит по mousedown
     * @param e
     * @protected
     */
    protected _clickHandler(e: ISyntheticMouseEvent): void {
        // если зажата клавиша Ctrl или это MacOs и зажата клавиша Cmd то не отменяем обработку события,
        // чтобы нативно открылась ссылка в новой вкладке в фоне
        if (
            e.nativeEvent.ctrlKey ||
            (detection.isMacOSDesktop && e.nativeEvent.metaKey)
        ) {
            return;
        }

        // иначе отменим обработку onClick только для левой кнопки мыши
        if (e.nativeEvent.button === 0) {
            e.preventDefault();
        }
    }

    // TODO Костыль для https://online.sbis.ru/opendoc.html?guid=fc34605f-3642-4a94-acdf-d2804df07069
    protected _mouseoverHandler(e: ISyntheticMouseEvent): void {
        if (this._recalcUrlBeforeNavigate) {
            this._mousoverRecalcCalled = true;
            this._recalcHref(this._options, this._options.Router.url.getUrl());
        }
    }
}

export default Reference;
