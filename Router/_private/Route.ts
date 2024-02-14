import { logger, location } from 'Application/Env';
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { IRouter } from './Router/Router';
import { IHistoryState, IRegisterableComponent } from './DataInterfaces';
import template = require('wml!Router/_private/Route');

interface IProgressBar {
    show: () => void;
    hide: () => void;
}
type TGetDataToRender = (url: string) => Promise<unknown>;
interface IRouteOptions extends IControlOptions {
    Router: IRouter;
    content?: Function;
    mask?: string;
    progressBar: IProgressBar;
    getDataToRender: TGetDataToRender;
}

const FILTERED_OPTIONS_NAMES: string[] = [
    'content',
    'mask',
    'theme',
    '_isSeparatedOptions',
    '_logicParent',
    'readOnly',
];

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
 * @extends UI/Base:Control
 * @control
 * @public
 * @author Мустафин Л.И.
 */
class Route extends Control<IRouteOptions> implements IRegisterableComponent {
    /**
     * @typedef {Object} IHistoryState
     * @property {Number} id Числовой идентификатор текущего состояния
     * @property {String} state Действительный адрес, с которым работает роутинг
     * @property {String} [href] "Красивый" адрес, который отображается пользователю
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
     * Более подробно виды масок описаны <a href="/doc/platform/developmentapl/interface-development/routing/mask-and-syntax/">в статье о роутинге</a>.
     * @example
     * Маска: "paramName/:paramValue"
     *
     * URL: "/paramName/valueOne"        -> paramValue = "valueOne"
     * URL: "/paramName/value/Two"       -> paramValue = "value"
     * URL: "/paramName/value?num=three" -> paramValue = "value"
     * URL: "/paramName/value#Four"      -> paramValue = "value"
     */

    /**
     * @name Router/_private/Route#content
     * @cfg {Content} Шаблон отображаемого содержимого
     */

    /**
     * @event Router/_private/Route#beforeChange Срабатывает перед каждым изменением url адреса
     * @param {UICommon/Events:SyntheticEvent} event Объект события
     * @param {IHistoryState} newLocation Cостояние, в которое был совершен переход
     * @param {IHistoryState} oldLocation Cостояние, из которого был совершен переход
     * @return Из обработчика события можно вернуть boolean значение либо Promise, который разрешится в boolean.
     *         Значение false остановит переход.
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

    /**
     * @event Router/_private/Route#urlChange Срабатывает после перехода, в котором значение параметров маски изменилось
     * @param {UICommon/Events:SyntheticEvent} event Объект события
     * @param {Object} newParameters Значения параметров после перехода
     * @param {Object} oldParameters Значения параметров до перехода
     * @example
     * <pre>
     * <Router.router:Route mask="alert/:alertType" on:urlChange="changeAlert()" />
     * </pre>
     * <pre>
     * Текущий адрес: "/home"
     * Переход по адресу: "/home/alert/signup" -> changeAlert(event, { alertType: 'signup' }, { alertType: undefined })
     * Переход по адресу: "/home/alert/login"  -> changeAlert(event, { alertType: 'login' }, { alertType: 'signup' })
     * Переход по адресу: "/home"              -> changeAlert(event, { alertType: undefined }, { alertType: 'login' })
     * </pre>
     */

    _template: TemplateFunction = template;

    protected _urlOptions: Record<string, unknown> = null;
    protected _pageConfig: unknown;
    private _isResolved: boolean = false;
    private _urlOptionsFields: string[] = [];
    private _urlChanged: boolean = false;
    private _progressBar: IProgressBar;
    private _getDataToRender: TGetDataToRender;

    _beforeMount(options: IRouteOptions): void {
        this._urlOptions = {};
        this._progressBar = options.progressBar;
        this._getDataToRender = options.getDataToRender;
        this._applyNewUrl(options.mask, options);
    }

    _componentDidMount(): void {
        if (typeof window !== 'undefined') {
            this._register();
        }
    }

    _afterMount(): void {
        this._checkUrlResolved();
    }

    _beforeUpdate(options: IRouteOptions): void {
        this._applyNewUrl(options.mask, options);
    }

    _beforeUnmount(): void {
        this._unregister();
    }

    private _register(): void {
        this._options.Router._manager.addRoute(
            this as IRegisterableComponent,
            (newLoc, oldLoc) => {
                return this._beforeApplyNewUrl(newLoc, oldLoc);
            },
            (newLoc) => {
                this._afterApplyNewUrl(newLoc);
                return true;
            }
        );
    }

    private _unregister(): void {
        this._options.Router._manager.removeRoute(this);
    }

    /**
     * Действие, которое выполнится ПЕРЕД сменой url-адреса
     */
    private _beforeApplyNewUrl(
        newLoc: IHistoryState,
        oldLoc: IHistoryState
    ): boolean | Promise<boolean> {
        this._urlChanged = false;

        const applyNewUrlOptions = (beforeChangeResult): boolean => {
            if (beforeChangeResult === false) {
                return false;
            }
            let result: boolean = true;

            const oldUrlOptions: Record<string, unknown> = this._urlOptions;
            const hasResolvedParam: boolean = this._applyNewUrl(
                this._options.mask,
                this._options,
                newLoc.state
            );

            if (hasResolvedParam && !this._isResolved) {
                result = this._notify('enter', [newLoc, oldLoc]) as boolean;
                this._isResolved = true;
            } else if (!hasResolvedParam && this._isResolved) {
                result = this._notify('leave', [newLoc, oldLoc]) as boolean;
                this._isResolved = false;
            }

            if (this._didOptionsChange(this._urlOptions, oldUrlOptions)) {
                this._notify('urlChange', [this._urlOptions, oldUrlOptions]);
                this._urlChanged = true;
            }
            return beforeChangeResult || result;
        };

        const result: boolean | Promise<boolean> = this._notify(
            'beforeChange',
            [newLoc, oldLoc]
        ) as boolean | Promise<boolean>;

        if (result && (result as Promise<boolean>).then) {
            return (result as Promise<boolean>)
                .then((res) => {
                    return applyNewUrlOptions(res);
                })
                .catch((err) => {
                    logger.error(err);
                    return false;
                });
        }
        return applyNewUrlOptions(result);
    }

    /**
     * Действие, которое выполнится ПОСЛЕ смены url-адреса
     */
    private _afterApplyNewUrl(newLoc: IHistoryState): void {
        if (!this._getDataToRender) {
            // поддержка старого поведения
            this._forceUpdate();
            return;
        }

        if (!this._urlChanged) {
            return;
        }

        this._progressBar?.show();
        const oldUrlOptions = this._urlOptions;
        this._getDataToRender(newLoc.state).then((pageConfig: unknown) => {
            // пока вызываем _getDataToRender пользователь мог уже кликнуть по другой ссылке
            // и загруженные данные уже неактульны. Поэтому pageConfig присваиваем только если загруженные
            // данные актуальны для текущего состояния Route
            if (!this._didOptionsChange(this._urlOptions, oldUrlOptions)) {
                this._pageConfig = pageConfig;
                this._urlChanged = false;
            }
        });
    }

    private _applyNewUrl(
        mask: string,
        options: IRouteOptions,
        newState?: string
    ): boolean {
        this._setUrlOptions(
            options.Router.maskResolver.calculateUrlParams(mask, newState)
        );
        const hasResolvedParam: boolean = this._hasResolvedParams(
            this._urlOptions
        );
        this._fillUrlOptionsFromOptions(options);
        return hasResolvedParam;
    }

    /**
     * Выяснить после разбора маски нашлись ли какие либо параметры в url-адресе
     */
    private _hasResolvedParams(urlOptions: Record<string, unknown>): boolean {
        let hasResolvedParam: boolean = false;
        for (const i in urlOptions) {
            if (urlOptions.hasOwnProperty(i) && urlOptions[i] !== undefined) {
                hasResolvedParam = true;
                break;
            }
        }
        return hasResolvedParam;
    }

    private _fillUrlOptionsFromOptions(options: IRouteOptions): void {
        for (const i in options) {
            if (
                options.hasOwnProperty(i) &&
                !this._isFilteredOptionName(i) &&
                !this._urlOptions.hasOwnProperty(i)
            ) {
                this._urlOptions[i] = options[i];
            }
        }
        // запишем query параметры для того, чтобы при изменении только query параметров контрол Route обновлялся
        this._urlOptions.urlQuery = location.search;
    }

    private _checkUrlResolved(): void {
        const _router = this._options.Router;
        const stateUrl = _router.url.getStateUrl();
        const urlOptions: Record<string, unknown> =
            _router.maskResolver.calculateUrlParams(
                this._options.mask,
                stateUrl
            );
        const hasResolvedParam: boolean = this._hasResolvedParams(urlOptions);
        this._fillUrlOptionsFromOptions(this._options);

        const currentState: IHistoryState = _router.history.getCurrentState();
        let prevState: IHistoryState = _router.history.getPrevState();
        if (hasResolvedParam) {
            if (this._didOptionsChange(urlOptions, this._urlOptions)) {
                this._setUrlOptions(urlOptions);
            }
            this._isResolved = true;
            if (!prevState) {
                prevState = {
                    state: _router.maskResolver.calculateHref(
                        this._options.mask,
                        { clear: true }
                    ),
                };
            }
            this._notify('enter', [currentState, prevState]);
            this._notify('urlChange', [this._urlOptions, {}]);
        }
    }

    private _setUrlOptions(newUrlOptions: Record<string, unknown>): void {
        this._urlOptions = newUrlOptions;
        this._urlOptionsFields = Object.keys(newUrlOptions);
    }

    private _isFilteredOptionName(optionName: string): boolean {
        return FILTERED_OPTIONS_NAMES.indexOf(optionName) >= 0;
    }

    private _didOptionsChange(
        newOptions: Record<string, unknown>,
        oldOptions: Record<string, unknown>
    ): boolean {
        let i: string;

        for (i in newOptions) {
            if (newOptions.hasOwnProperty(i)) {
                if (
                    !oldOptions.hasOwnProperty(i) ||
                    newOptions[i] !== oldOptions[i]
                ) {
                    return true;
                }
            }
        }
        for (i in oldOptions) {
            if (
                oldOptions.hasOwnProperty(i) &&
                // проверка только полей опции, т.к. в старом _urlOptions есть поля типа vdomCORE, _$createdFromCode
                // а в новом _urlOptions этих полей нет и быть не может
                (this._urlOptionsFields.length === 0 ||
                    this._urlOptionsFields.indexOf(i) >= 0) &&
                !newOptions.hasOwnProperty(i)
            ) {
                return true;
            }
        }

        return false;
    }
}

export default Route;
