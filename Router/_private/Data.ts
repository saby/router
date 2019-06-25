/// <amd-module name="Router/_private/Data" />

import StoreManager, { ICoreInstance } from './StoreManager';

import * as UrlRewriter from './UrlRewriter';

export interface IHistoryState {
    id?: number;
    state: string;
    href?: string;
}

export type TStateChangeFunction = (newLoc: IHistoryState, oldLoc: IHistoryState) => Promise<boolean>;

export interface IRegisterableComponent {
    getInstanceId: () => number;
}

export interface IRegisteredRoute {
    beforeUrlChangeCb: TStateChangeFunction;
    afterUrlChangeCb: TStateChangeFunction;
}

export interface IRegisteredReference {
    afterUrlChangeCb: TStateChangeFunction;
}

export interface IRouterData {
    IS_ROUTER_STORAGE: boolean;
    history: IHistoryState[];
    historyPosition: number;
    registeredRoutes: HashMap<IRegisteredRoute>;
    registeredReferences: HashMap<IRegisteredReference>;
    coreInstance?: ICoreInstance;
    relativeUrl: string;
}

export interface ISyntheticClickEvent {
    preventDefault: () => void;
    nativeEvent: MouseEvent;
    routerReferenceNavigation?: boolean;
}

/*
 * @function Router/_private/Data#getHistory
 * Get the list of stored history states
 * @returns {IHistoryState[]} list of history states
 */
/**
 * @function Router/_private/Data#getHistory
 * Возвращает список состояний истории роутера
 * @returns {IHistoryState[]} список состояний истории
 */
export function getHistory(): IHistoryState[] {
    return _getField('history');
}

/*
 * @function Router/_private/Data#setHistory
 * Replaces the list of stored history states
 * @param {IHistoryState[]} value new list of history states
 * @private
 */
/**
 * @function Router/_private/Data#setHistory
 * Заменяет список состояний истории роутера
 * @param {IHistoryState[]} value новый список состояний истории
 * @private
 */
export function setHistory(value: IHistoryState[]): void {
    _setField('history', value);
}

/*
 * @function Router/_private/Data#getHistoryPosition
 * Get the index of the history state that is currently active
 * @returns {Number} index of the active history state
 */
/**
 * @function Router/_private/Data#getHistoryPosition
 * Возвращает индекс активного в данный момент состояния истории
 * @returns {Number} индекс активного состояния истории
 */
export function getHistoryPosition(): number {
    return _getField('historyPosition');
}

/*
 * @function Router/_private/Data#setHistoryPosition
 * Activates the history state with the specified index
 * @param {Number} value index of the state to activate
 * @private
 */
/**
 * @function Router/_private/Data#setHistoryPosition
 * Активирует состояние истории с заданным индексом
 * @param {Number} value индекс состояния, которое должно быть активировано
 * @private
 */
export function setHistoryPosition(value: number): void {
    _setField('historyPosition', value);
}

/*
 * @function Router/_private/Data#getRelativeUrl
 * Get the current "actual" URL that Router is working with
 * @returns {String} "actual" URL
 */
/**
 * @function Router/_private/Data#getRelativeUrl
 * Возвращает текущее значение действительного URL, с которым работает роутинг
 * @returns {String} действительный URL
 */
export function getRelativeUrl(): string {
    return _getField('relativeUrl') || _calculateRelativeUrl();
}

/*
 * @function Router/_private/Data#setRelativeUrl
 * Sets the value of "actual" URL
 * @param {String} value url to set
 * @private
 */
/**
 * @function Router/_private/Data#setRelativeUrl
 * Устанавливает значение текущего действительного URL
 * @param {String} value значение для установки
 * @private
 */
export function setRelativeUrl(value: string): void {
    _setField('relativeUrl', value);
}

/*
 * @function Router/_private/Data#getVisibleRelativeUrl
 * Get the current value of "pretty" URL that is displayed to the user
 * @returns {String} pretty url
 */
/**
 * @function Router/_private/Data#getVisibleRelativeUrl
 * Получить текущее значение "красивого" URL, отображаемого пользователю
 * @returns {String} значение красивого URL
 */
export function getVisibleRelativeUrl(): string {
    return _calculateRelativeUrl();
}

/*
 * @function Router/_private/Data#getRegisteredRoutes
 * Get the HashMap of all Routes currently registered by Router
 * @returns {Object}
 * @private
 */
/**
 * @function Router/_private/Data#getRegisteredRoutes
 * Возвращает HashMap всех Route'ов зарегистрированных в системе роутинга
 * на данный момент
 * @returns {Object}
 * @private
 */
export function getRegisteredRoutes(): HashMap<IRegisteredRoute> {
    return _getField('registeredRoutes');
}

/*
 * @function Router/_private/Data#getRegisteredReferences
 * Get the HashMap of all References currently registered by Router
 * @returns {Object}
 * @private
 */
/**
 * @function Router/_private/Data#getRegisteredReferences
 * Возвращает HashMap всех Reference'ов зарегистрированных в системе роутинга
 * на данный момент
 * @returns {Object}
 * @private
 */
export function getRegisteredReferences(): HashMap<IRegisteredReference> {
    return _getField('registeredReferences');
}

/*
 * @function Router/_private/Data#getCoreInstance
 * Get the instance of Application/Core if it exists on the page
 * @returns {Controls/Application/Core}
 * @private
 */
/**
 * @function Router/_private/Data#getCoreInstance
 * Возвращает экземпляр Application/Core, если он существует на странице
 * @returns {Controls/Application/Core}
 * @private
 */
export function getCoreInstance(): ICoreInstance {
    return StoreManager.getCoreInstance();
}

function _initNewStorage(storage: Record<string, unknown>): void {
    const currentUrl = _calculateRelativeUrl();
    const initialHistoryState: IHistoryState = {
        id: 0,
        state: UrlRewriter.get(currentUrl),
        href: currentUrl
    };

    if (typeof window !== 'undefined') {
        if (window.history.state && typeof window.history.state.id === 'number') {
            initialHistoryState.id = window.history.state.id;
        } else if (!window.history.state) {
            window.history.replaceState(initialHistoryState, initialHistoryState.href, initialHistoryState.href);
        }
    }

    const initialStorage: IRouterData = {
        IS_ROUTER_STORAGE: true,
        history: [initialHistoryState],
        historyPosition: 0,
        registeredRoutes: {},
        registeredReferences: {},
        relativeUrl: initialHistoryState.state
    };
    Object.assign(storage, initialStorage);
}

function _getStorage(): IRouterData {
    const storage = StoreManager.getRouterStore();
    if (!storage || (storage && !storage.IS_ROUTER_STORAGE)) {
        _initNewStorage(storage);
    }
    return storage as IRouterData;
}

function _calculateRelativeUrl(): string {
    const location = StoreManager.getLocation();

    if (location) {
        return location.pathname + location.search + location.hash;
    } else {
        return null;
    }
}

function _getField<T>(fieldName: string): T {
    return _getStorage()[fieldName];
}

function _setField<T>(fieldName: string, value: T): T {
    const storage = _getStorage();
    return (storage[fieldName] = value);
}
