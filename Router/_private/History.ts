import UrlRewriter from './UrlRewriter';
import RouterUrl from './Router/RouterUrl';
import { IHistoryState } from './DataInterfaces';
import { IWindowHistory } from './Router/WindowHistory';

// максимальное количество SPA переходов для хранения в истории
export const SPA_HISTORY_MAX_LENGTH = 20;

/**
 * Интерфейс класса методов для взаимодействия с историей Роутера.
 * @interface Router/_private/IHistory
 * @public
 * @author Мустафин Л.И.
 */
export interface IHistory {
    /**
     * Производит переход в истории на одно состояние (предыдущее или заданное) назад
     * @function
     * @param {Router/_private/IHistoryState} newState новое состояние - когда происходит переход назад не на
     * предыдущее состояние, а состояние ранее предыдущего
     * @remark
     * Этот метод не влияет на window.history и адресную строку браузера,
     * только внутреннее состояние роутинга.
     * Для совершения перехода назад и изменении как состояния роутера,
     * так и состояния истории и адресной строки браузера, используйте
     * нативный метод window.history.back
     */
    back(newState?: IHistoryState): void;
    /**
     * Производит переход в истории на одно (следующее или заданное) состояние вперед
     * @function
     * @param {Router/_private/IHistoryState} newState новое состояние - когда происходит переход не на следующее
     * состояние, а состояние через следующее вперед
     * @remark
     * Этот метод не влияет на window.history и адресную строку браузера, только внутреннее состояние роутинга.
     * Для совершения перехода вперед и изменения как состояния роутера, так и состояния истории и адресной строки браузера,
     * используйте нативный метод window.history.forward
     */
    forward(newState?: IHistoryState): void;
    /**
     * Переводит роутинг в новое состояние, записывая его в window.history
     * @function
     * @param {Router/_private/IHistoryState} newState состояние для добавления
     * @remark
     * Вызов этого метода не провоцирует обновление компонентов роутинга
     * (таких как Route и Reference), он только производит запись состояния
     * в историю окна и историю роутинга.
     * Для перехода в новое состояние с обновлением компонентов роутинга,
     * используйте метод **{@link Router/router:IRouter#navigate navigate}**.
     * @see Router/router:IRouter#navigate
     */
    push(newState: IHistoryState): void;
    /**
     * Заменяет текущее состоянии истории на переданное
     * @function
     * @param {Router/_private/IHistoryState} newState состояние для замены
     * Вызов этого метода не провоцирует обновление компонентов роутинга
     * (таких как Route и Reference), он только производит запись состояния
     * в историю окна и историю роутинга.
     * Для перехода в новое состояние с обновлением компонентов роутинга,
     * используйте метод **{@link Router/router:IRouter#navigate replaceState}**.
     * @see Router/router:IRouter#replaceState
     */
    replaceState(newState: IHistoryState): void;
    /**
     * Возвращает предыдущее состояние истории (если такое есть).
     * @function
     * @returns {Router/_private/IHistoryState}
     */
    getPrevState(): IHistoryState;
    /**
     * Возвращает текущее состояние истории.
     * @function
     * @returns {Router/_private/IHistoryState}
     */
    getCurrentState(): IHistoryState;
    /**
     * Возвращает следующее состояние истории (если такое есть).
     * @function
     * @returns {Router/_private/IHistoryState}
     */
    getNextState(): IHistoryState;
    /**
     * Возвращает список состояний истории роутера.
     * @function
     * @returns {IHistoryState[]} Список состояний истории.
     */
    getHistory(): IHistoryState[];
    /**
     * Возвращает индекс активного в данный момент состояния истории
     * @function
     * @returns {Number} индекс активного состояния истории
     */
    getHistoryPosition(): number;
}

/**
 * Набор методов для взаимодействия с Историей Роутера.
 * @private
 * @author Мустафин Л.И.
 */
export default class History implements IHistory {
    /**
     * История переходов роутера
     */
    protected _routerHistory: IHistoryState[];
    /**
     * текущая позиция активной страницы из истории роутера
     */
    private _historyPosition: number;
    /**
     * История SPA переходов
     */
    protected _spaHistory: string[] = [];
    /**
     * Функция-callback, который вызываем для установки
     */
    private _setSpaHistory?: (spaHistory: string[]) => void;

    constructor(
        private _urlRewriter: UrlRewriter,
        private _routerUrl: RouterUrl,
        private _windowHistory: IWindowHistory,
        setSpaHistory?: (spaHistory: string[]) => void
    ) {
        this._setSpaHistory =
            typeof setSpaHistory === 'function' ? setSpaHistory : () => {};
        this._initHistory();
    }

    /**
     * Инициализация изначального состояния истории роутера
     */
    private _initHistory(): void {
        const currentUrl: string = this._routerUrl.getUrl();
        const initialState: IHistoryState = {
            id: 0,
            state: this._urlRewriter.get(currentUrl),
            href: currentUrl,
        };

        if (typeof window !== 'undefined') {
            if (
                this._windowHistory.state &&
                typeof this._windowHistory.state.id === 'number'
            ) {
                initialState.id = this._windowHistory.state.id;
            } else if (!this._windowHistory.state) {
                this._windowHistory.replaceState(
                    initialState,
                    initialState.href,
                    initialState.href
                );
            }
        }

        this._setHistory([initialState]);
        this._setHistoryPosition(0);
        this._updateSpaHistory();
    }

    /**
     * Производит переход в истории на одно состояние (предыдущее или заданное) назад
     * @function
     * @param {Router/_private/IHistoryState} newState новое состояние - когда происходит переход назад не на
     * предыдущее состояние, а состояние ранее предыдущего
     * @remark
     * Этот метод не влияет на window.history и адресную строку браузера,
     * только внутреннее состояние роутинга.
     * Для совершения перехода назад и изменении как состояния роутера,
     * так и состояния истории и адресной строки браузера, используйте
     * нативный метод window.history.back
     */
    back(newState?: IHistoryState): void {
        const history: IHistoryState[] = this.getHistory();
        const historyPosition: number = this.getHistoryPosition();

        if (historyPosition === 0) {
            const newHistoryState: IHistoryState =
                this._calculateNewHistoryState(newState);
            history.unshift({
                id: history[0].id - 1,
                state: newHistoryState.state,
                href: newHistoryState.href,
            });
        } else if (newState && newState.state) {
            // при переходе назад на несколько состояний (стрелкой в браузере)
            // необходимо пересчитать новую позицию истории роутинга
            let newPosition: number = historyPosition - 1;
            for (let i = 0; i < history.length; i++) {
                if (history[i].state === newState.state) {
                    newPosition = i;
                    break;
                }
            }
            this._setHistoryPosition(newPosition);
        } else {
            this._setHistoryPosition(historyPosition - 1);
        }

        this._updateSpaHistory();
        this._updateStateUrl();
    }

    /**
     * Производит переход в истории на одно (следующее или заданное) состояние вперед
     * @function
     * @param {Router/_private/IHistoryState} newState новое состояние - когда происходит переход не на следующее
     * состояние, а состояние через следующее вперед
     * @remark
     * Этот метод не влияет на window.history и адресную строку браузера, только внутреннее состояние роутинга.
     * Для совершения перехода вперед и изменения как состояния роутера, так и состояния истории и адресной строки браузера,
     * используйте нативный метод window.history.forward
     */
    forward(newState?: IHistoryState): void {
        const history: IHistoryState[] = this.getHistory();
        let newHistoryPosition: number = this.getHistoryPosition() + 1;

        // при переходе вперед на несколько состояний (стрелкой в браузере)
        // необходимо пересчитать новую позицию истории роутинга
        if (newState && newState.state && newHistoryPosition < history.length) {
            for (let i = newHistoryPosition; i < history.length; i++) {
                if (history[i].state === newState.state) {
                    newHistoryPosition = i;
                    break;
                }
            }
        }

        this._setHistoryPosition(newHistoryPosition);
        if (newHistoryPosition === history.length) {
            const newHistoryState: IHistoryState =
                this._calculateNewHistoryState(newState as IHistoryState);
            history.push({
                id: history[newHistoryPosition - 1].id + 1,
                state: newHistoryState.state,
                href: newHistoryState.href,
            });
        }

        this._updateSpaHistory();
        this._updateStateUrl();
    }

    /**
     * Вычислим правильные state и href для нового состояния истории переходов
     * Либо его передали при переходе (по стрелке в браузере), либо возьмем его из window.history
     * Если в итоге не найдем, то потом оно будет вычислено из URL-адреса, которое сейчас отображается в адресной строке
     * @param newState
     */
    private _calculateNewHistoryState(newState: IHistoryState): IHistoryState {
        if (newState && newState.state) {
            return {
                state: this._urlRewriter.get(newState.state),
                href:
                    newState.href ||
                    this._urlRewriter.getReverse(newState.state),
            };
        }

        // Если в window.history уже есть state, то используем его, вместо того, чтобы вычислять
        const windowHistoryState: { state: string } | undefined | null =
            window?.history?.state;
        const currentState: string | undefined | null =
            windowHistoryState && windowHistoryState.state;
        const currentHref: string = this._routerUrl.getUrl();
        return {
            state: currentState || this._urlRewriter.get(currentHref),
            href: currentHref,
        };
    }

    /**
     * Переводит роутинг в новое состояние, записывая его в window.history
     * @function
     * @param {Router/_private/IHistoryState} newState состояние для добавления
     * @remark
     * Вызов этого метода не провоцирует обновление компонентов роутинга
     * (таких как Route и Reference), он только производит запись состояния
     * в историю окна и историю роутинга.
     * Для перехода в новое состояние с обновлением компонентов роутинга,
     * используйте метод **{@link Router/router:IRouter#navigate navigate}**.
     * @see Router/router:IRouter#navigate
     */
    push(newState: IHistoryState): void {
        const history: IHistoryState[] = this.getHistory();
        const historyPosition: number = this.getHistoryPosition();

        // remove all states after the current state
        history.length = historyPosition + 1;

        // add new history state to the store
        newState.id = history[historyPosition].id + 1;
        history.push(newState);
        this._setHistoryPosition(historyPosition + 1);

        this._updateSpaHistory();
        // update the URL
        this._updateStateUrl();
        const displayUrl: string = newState.href || newState.state;
        this._windowHistory.pushState(newState, displayUrl, displayUrl);
    }

    /**
     * Заменяет текущее состоянии истории на переданное
     * @function
     * @param {Router/_private/IHistoryState} newState состояние для замены
     * Вызов этого метода не провоцирует обновление компонентов роутинга
     * (таких как Route и Reference), он только производит запись состояния
     * в историю окна и историю роутинга.
     * Для перехода в новое состояние с обновлением компонентов роутинга,
     * используйте метод **{@link Router/router:IRouter#navigate replaceState}**.
     * @see Router/router:IRouter#replaceState
     */
    replaceState(newState: IHistoryState): void {
        const history: IHistoryState[] = this.getHistory();
        const historyPosition: number = this.getHistoryPosition();
        const currentState: IHistoryState = history[historyPosition];

        newState.id = currentState.id;
        newState.href =
            newState.href || this._urlRewriter.getReverse(newState.state);

        history[historyPosition] = newState;

        this._updateSpaHistory(true);
        this._updateStateUrl();
        this._windowHistory.replaceState(
            newState,
            newState.href,
            newState.href
        );
    }

    private _updateStateUrl(): void {
        this._routerUrl.setStateUrl(this.getCurrentState().state);
    }

    /**
     * Возвращает предыдущее состояние истории (если такое есть).
     * @function
     * @returns {Router/_private/IHistoryState}
     */
    getPrevState(): IHistoryState {
        return this.getHistory()[this.getHistoryPosition() - 1];
    }

    /**
     * Возвращает текущее состояние истории.
     * @function
     * @returns {Router/_private/IHistoryState}
     */
    getCurrentState(): IHistoryState {
        return this.getHistory()[this.getHistoryPosition()];
    }

    /**
     * Возвращает следующее состояние истории (если такое есть).
     * @function
     * @returns {Router/_private/IHistoryState}
     */
    getNextState(): IHistoryState {
        return this.getHistory()[this.getHistoryPosition() + 1];
    }

    /**
     * Возвращает список состояний истории роутера.
     * @function
     * @returns {IHistoryState[]} Список состояний истории.
     */
    getHistory(): IHistoryState[] {
        return this._routerHistory;
    }

    /**
     * Заменяет список состояний истории роутера
     * @param {IHistoryState[]} value Новый список состояний истории.
     * @hidden
     */
    protected _setHistory(newRouterHistory: IHistoryState[]): void {
        this._routerHistory = newRouterHistory;
    }

    /**
     * Возвращает индекс активного в данный момент состояния истории
     * @function
     * @returns {Number} индекс активного состояния истории
     */
    getHistoryPosition(): number {
        return this._historyPosition;
    }

    /**
     * Активирует состояние истории с заданным индексом
     * @param {Number} value индекс состояния, которое должно быть активировано
     * @hidden
     */
    protected _setHistoryPosition(position: number): void {
        this._historyPosition = position;
    }

    /**
     * Возвращает список с url последних 20 SPA переходов
     */
    getSpaHistory(): string[] {
        return this._spaHistory;
    }

    private _updateSpaHistory(replace: boolean = false): void {
        const historyItem = this.getCurrentState();
        if (replace) {
            this._spaHistory.pop();
        }
        this._spaHistory.push(historyItem.href || historyItem.state);

        // в истории храним максимум 20 предыдущих переходов. остальные удаляем
        while (this._spaHistory.length > SPA_HISTORY_MAX_LENGTH) {
            this._spaHistory.shift();
        }

        this._setSpaHistory(this._spaHistory);
    }
}
