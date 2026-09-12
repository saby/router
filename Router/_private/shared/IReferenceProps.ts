import { ReactNode, Ref } from 'react';
import { IHistoryState } from '../DataInterfaces';

/**
 * Объект события
 * @public
 */
export interface ISyntheticMouseEvent {
    preventDefault: () => void;
    nativeEvent: MouseEvent;
    routerReferenceNavigation?: boolean;
    stopPropagation: Function;
}

/**
 * Опции компонента Reference
 * @public
 */
export interface IReferenceProps extends Record<string, unknown> {
    /**
     * Маска, определяющая как должен быть изменен текущий адрес при переходе по ссылке.
     * @remark
     * В маске указывается та часть адреса, которая должне быть изменена при переходе по ссылке. Значение
     * для каждого placeholder'a также должно быть передано в Reference в качестве опции (см. пример).
     *
     * Опция state поддерживает те же типы масок, что и Router.router:Route. Более подробно о видах масок
     * можно <a href="https://link.sbis.ru/article/wasaby/eec9bf40-4589-4a40-b841-a4e12fbd3f08#toc_26ad4d13-1927-4939-86ab-4b4679cb1ea2">прочитать в статье</a>.
     *
     * Если маска в текущем адресе отсутствует, URL-адрес при переходе будет не изменен, а дополнен этой
     * маской с соответствующим значением.
     * Если вместо значений параметров передана опция `clear="{{ true }}"`, вместо изменения или дополнения
     * URL-адреса по маске, часть адреса, совпадающая с маской, будет удалена из URL.
     * @see Router/router:IReferenceProps#clear
     * @see Router/router:IReferenceProps#href
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
    state: string;
    /**
     * Маска, определяющая как должен быть изменен "красивый" адрес при переходе по ссылке.
     * @see Router/router:IReferenceProps#state
     * @remark
     * "Красивым" называется адрес, отображающийся в адресной строке браузера пользователя. Он не обязательно
     * должен соответствовать реальному адресу, с которым работает система роутинга.
     *
     * Если опция href не задана, в качестве красивого адреса будет использоваться реальный адрес, изменяемый
     * опцией state, что подходит в большинстве случаев.
     *
     * Более подробно о красивых адресах можно <a href="https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_18921982-af21-4882-9b1f-06da569098f9">
     * прочитать в статье</a>.
     *
     * Опция href поддерживает те же виды масок и параметров, как и опция state.
     */
    href?: string;
    /**
     * Определяет, нужно ли удалить часть адреса, соответствующую маскам (state и href).
     * Если эта опция не установлена, часть адреса будет изменена, а не удалена. По умолчанию false.
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
    clear?: boolean;
    /**
     * Признак того, что нужно пересчитывать url ссылки при наведении на неё мышкой.
     * По умолчанию false.
     */
    recalcUrlBeforeNavigate?: boolean;
    /**
     * Признак того, что необходимо полностью заменить url переданной маской. По умолчанию false.
     * @example
     * <pre>
     * <Router.router:Reference state="destination/:country" country="Italy" replace={{true}}>
     *    <a href="{{ content.href }}">Go to Italy</a>
     * </Router.router:Reference>
     * </pre>
     *
     * Текущий адрес: "/some/url" -> После перехода: "/destination/Italy"
     */
    replace?: boolean;
    /**
     * Признак того, что необходимо учитывать слеш в конце маски. По умолчанию false.
     * @example
     * <pre>
     * <Router.router:Reference state="/destination/:country/" country="Italy" trailingSlash={{true}}>
     *    <a href="{{ content.href }}">Go to Italy</a>
     * </Router.router:Reference>
     * </pre>
     * Текущий адрес: "/some/url" -> После перехода: "/destination/Italy/"
     */
    trailingSlash?: boolean;

    /**
     * Коллбек при клике на Reference, перед совершением перехода.
     * @param newState Состояние, в которое Reference совершает переход
     * @param syntheticClickEvent Объект события клика, который привел к совершению перехода
     * @remark
     * В обработчике onNavigate можно выполнить действия перед переходом в новое состояние.
     * Состояние, переданное в качестве параметра события, может быть изменено, чтобы изменить
     * результат перехода.
     * Из обработчика события можно вернуть **false**, чтобы предотвратить переход.
     */
    onNavigate?: (newState: IHistoryState, syntheticClickEvent: ISyntheticMouseEvent) => boolean;

    /**
     * Обработчик, который будет вызван перед обработчиком клика
     * Если результат false, то клик будет отменен.
     * @hidden
     */
    onMouseDown?: (e: ISyntheticMouseEvent) => boolean;

    content?: Function;

    children: ReactNode;

    className?: string;

    forwardedRef?: Ref<HTMLElement>;

    /**
     * @private
     */
    'data-qa'?: string;
}
