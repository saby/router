import { Component, cloneElement, forwardRef, useContext, isValidElement } from 'react';
import type { ReactElement, Ref, JSXElementConstructor } from 'react';
import { detection } from 'Env/Env';
import { getWasabyContext } from 'UI/Contexts';
import { getRootRouter, IRouter } from './Router/Router';
import type { IHistoryState, IRegisterableComponent } from './DataInterfaces';
import ContextProvider from './context/ContextProvider';
import RouterContext from './context/Context';
import type { IReferenceProps, ISyntheticMouseEvent } from './shared/IReferenceProps';
import { calculateReferenceHref } from './shared/calculateReferenceHref';

/**
 * Интерфейс состяния компонента
 * @private
 */
export interface IReferenceState {
    state: string;
    href: string;
}

let counter: number = 0;

/**
 * Компонент, вычисляющий новый URL-адрес по заданной маске и указанным параметрам.
 * Вычисленный адрес передается внутрь компонента под именем href.
 * При клике на Reference совершается переход по выбранному адресу без перезагрузки страницы.
 *
 * <a href="https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_5c8657d5-0e15-4220-872b-590f6c00c39a" target="_blank">Статья о компоненте</a>
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
 * @private
 * @author Мустафин Л.И.
 */
class Reference
    extends Component<IReferenceProps, IReferenceState>
    implements IRegisterableComponent
{
    context: IRouter;
    private readonly _instId: string = 'reference_' + counter++;

    /**
     * Конструктор класса
     */
    constructor(props: IReferenceProps, context: IRouter) {
        super(props);

        this.state = calculateReferenceHref(props, context || getRootRouter(true));

        this._mousedownHandler = this._mousedownHandler.bind(this);
        this._clickHandler = this._clickHandler.bind(this);
        this._mouseoverHandler = this._mouseoverHandler.bind(this);
    }

    getInstanceId(): string {
        return this._instId;
    }

    componentDidMount(): void {
        this.Router._manager.addReference(this, () => {
            this.setState(calculateReferenceHref(this.props, this.Router));
            return true;
        });
    }

    componentDidUpdate(_: Readonly<IReferenceProps>, prevState: Readonly<IReferenceState>): void {
        const newState = calculateReferenceHref(this.props, this.Router);
        if (prevState.state !== newState.state || prevState.href !== newState.href) {
            this.setState(newState);
        }
    }

    componentWillUnmount(): void {
        this.Router._manager.removeReference(this);
    }

    render(): ReactElement {
        const addProps: { onMouseOverCallback?: () => void; 'data-qa'?: string } = {};
        if (isValidElement(this.props.children) && typeof this.props.children.type !== 'string') {
            // коллбек onMouseOver для списков необходимо прокидывать как onMouseOverCallback
            // https://online.sbis.ru/opendoc.html?guid=8921e8d2-dfa7-49dd-8ae4-c7f98c54f02d&client=3
            addProps.onMouseOverCallback = this._mouseoverHandler;
            // на теги (в частности тег <a/>) не прокидываем этот проп, т.к. реакт ругается на обработчик неизвестного события
        }
        if ('data-qa' in this.props) {
            addProps['data-qa'] = this.props['data-qa'];
        }

        const childrenProps =
            // @ts-ignore react-19-enable
            this.props.children && 'props' in this.props.children
                ? // @ts-ignore react-19-enable
                  (this.props.children.props as object)
                : {};
        const props = {
            ...childrenProps,
            className: this.props.className,
            href: this.state.href || this.state.state,
            onMouseDown: this._mousedownHandler,
            onClick: this._clickHandler,
            onMouseOver: this._mouseoverHandler,
            ...addProps,
            ref: this.props.forwardedRef,
        };
        return cloneElement(this.props.children as ReactElement, props);
    }

    protected get Router(): IRouter {
        return this.context || getRootRouter(true);
    }

    protected _mousedownHandler(e: ISyntheticMouseEvent): void {
        // обрабатываем только если кликнули левой кнопкой мыши
        if (e.nativeEvent.button !== 0) {
            return;
        }

        // если зажата клавиша Ctrl или это MacOs и зажата клавиша Cmd то ничего не делаем,
        // чтобы событие дошло до обработчика onClick - там нативно откроется ссылку в новой вкладке в фоне
        if (e.nativeEvent.ctrlKey || (detection.isMacOSDesktop && e.nativeEvent.metaKey)) {
            return;
        }

        if (this.props.onMouseDown?.(e) === false) {
            return;
        }

        const navigateTo: IHistoryState = {
            state: this.state.state,
            href: this.state.href,
        };

        // Tag the event as handled by Router.router:Reference, useful
        // for checks in other routing components
        e.routerReferenceNavigation = true;

        // navigate event can be handled by the user to prevent the
        // standard single page navigation
        if (!this.props.onNavigate || this.props.onNavigate(navigateTo, e) !== false) {
            this.Router.navigate(navigateTo);
        }
    }

    /**
     * Обработка клика по ссылке
     * просто отменим событие клика, т.к. переход на новый url происходит по mousedown
     * @param e
     */
    protected _clickHandler(e: ISyntheticMouseEvent): void {
        // если зажата клавиша Ctrl или это MacOs и зажата клавиша Cmd то не отменяем обработку события,
        // чтобы нативно открылась ссылка в новой вкладке в фоне
        if (e.nativeEvent.ctrlKey || (detection.isMacOSDesktop && e.nativeEvent.metaKey)) {
            return;
        }

        // иначе отменим обработку onClick только для левой кнопки мыши
        if (e.nativeEvent.button === 0) {
            e.preventDefault();
        }
    }

    // для https://online.sbis.ru/opendoc.html?guid=fc34605f-3642-4a94-acdf-d2804df07069
    protected _mouseoverHandler(): void {
        if (this.props.recalcUrlBeforeNavigate) {
            this.setState(
                calculateReferenceHref(this.props, this.Router, this.Router.url.getLogicUrl())
            );
        }
    }

    static contextType: typeof RouterContext = RouterContext;

    static displayName: string = 'Router/router:Reference';
}

export { Reference };

/**
 * Компонент, вычисляющий новый URL-адрес по заданной маске и указанным параметрам.
 * Вычисленный адрес передается внутрь компонента под именем href.
 * При клике на Reference совершается переход по выбранному адресу без перезагрузки страницы.
 *
 * <a href="https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_5c8657d5-0e15-4220-872b-590f6c00c39a" target="_blank">Статья о компоненте</a>
 *
 * @example
 * Обычно Router.router:Reference используется в сочетании с элементом ссылки `a`, так как
 * это позволяет пользователю видеть адрес перед кликом на ссылку в браузере.
 *
 * <pre>
 * import { Reference } from 'Router/router';
 *
 * export function MyComponent(): JSX.Element {
 *     return (
 *         <Reference state="destination/:country" country="Italy">
 *             <Inner />
 *         </Reference>
 *     );
 * }
 *
 * function Inner(props: { href: string }): JSX.Element {
 *     return <a href={ props.href }>Go to Italy</a>;
 * }
 * </pre>
 *
 * Текущий адрес: "/book" -> После клика: "/book/destination/Italy"
 * Текущий адрес: "/book/destination/Russia" -> После перехода: "/book/destination/Italy"
 * Текущий адрес: "/book/destination/0/day/Tue?price=mid" -> После перехода: "/book/destination/Italy/day/Tue?price=mid"
 * Текущий адрес: "/book/all" -> После перехода: "/book/all/destination/Italy"
 *
 * @public
 * @author Мустафин Л.И.
 */
// @ts-ignore react-19-enable
const ReferenceWrapper = forwardRef(function Wrapper(
    props: IReferenceProps,
    ref: Ref<HTMLElement>
): ReactElement<IReferenceProps, JSXElementConstructor<Reference>> {
    const Router = useContext(RouterContext);
    const context = useContext(getWasabyContext());

    if (context.Router && (!Router || context.Router.instId > Router.instId)) {
        return (
            <ContextProvider Router={context.Router}>
                <Reference {...props} forwardedRef={ref} />
            </ContextProvider>
        );
    }
    return <Reference {...props} forwardedRef={ref} />;
});

ReferenceWrapper.displayName = `wrapToContext(${Reference.displayName})`;

export default ReferenceWrapper;
