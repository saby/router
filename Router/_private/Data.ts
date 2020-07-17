/// <amd-module name="Router/_private/Data" />

/**
 * Набор методов для хранения состояний истории роутера
 * @module
 * @name Router/_private/Data
 * @author Санников К.А.
 */

import StoreManager, { ICoreInstance } from './StoreManager';

import * as UrlRewriter from './UrlRewriter';
import { ILocation } from 'Application/Interface';

/**
 * Одно состояние истории роутера.
 * @interface Router/_private/Data/IHistoryState
 * @public
 */
export interface IHistoryState {
    /** Числовой идентификатор состояния истории */
    id?: number;
    /** Адрес состояния истории */
    state: string;
    /** "Красивый" адрес состояния истории */
    href?: string;
}

export type TStateChangeFunction = (newLoc: IHistoryState, oldLoc: IHistoryState) => Promise<boolean>;

export interface IRegisterableComponent {
    getInstanceId: () => string;
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
    registeredRoutes: Record<string, IRegisteredRoute>;
    registeredReferences: Record<string, IRegisteredReference>;
    coreInstance?: ICoreInstance;
    relativeUrl: string;
}

export interface ISyntheticClickEvent {
    preventDefault: () => void;
    nativeEvent: MouseEvent;
    routerReferenceNavigation?: boolean;
}

/*
 * Get the list of stored history states
 * @function
 * @name Router/_private/Data#getHistory
 * @returns {IHistoryState[]} list of history states
 */
/**
 * Возвращает список состояний истории роутера.
 * @function
 * @name Router/_private/Data#getHistory
 * @returns {IHistoryState[]} Список состояний истории.
 */
export function getHistory(): IHistoryState[] {
    return _getField('history');
}

/*
 * Replaces the list of stored history states.
 * @function
 * @name Router/_private/Data#setHistory
 * @param {IHistoryState[]} Value new list of history states.
 * @private
 */
/**
 * Заменяет список состояний истории роутера
 * @function
 * @name Router/_private/Data#setHistory
 * @param {IHistoryState[]} value Новый список состояний истории.
 * @private
 */
export function setHistory(value: IHistoryState[]): void {
    _setField('history', value);
}

/*
 * Get the index of the history state that is currently active
 * @function
 * @name Router/_private/Data#getHistoryPosition
 * @returns {Number} index of the active history state
 */
/**
 * Возвращает индекс активного в данный момент состояния истории
 * @function
 * @name Router/_private/Data#getHistoryPosition
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
 * Активирует состояние истории с заданным индексом
 * @function
 * @name Router/_private/Data#setHistoryPosition
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
* Возвращает текущее значение действительного URL, с которым работает роутинг.
 * @function
 * @name Router/_private/Data#getRelativeUrl
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
 * Устанавливает значение текущего действительного URL.
 * @function
 * @name Router/_private/Data#setRelativeUrl
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
 * Получить текущее значение "красивого" URL, отображаемого пользователю.
 * @function
 * @name Router/_private/Data#getVisibleRelativeUrl
 * @returns {String} Значение красивого URL.
 */
export function getVisibleRelativeUrl(): string {
    return _calculateRelativeUrl();
}

/*
 * @function Router/_private/Data#getRegisteredRoutes
 * Get the Record of all Routes currently registered by Router
 * @returns {Object}
 * @private
 */
/**
 * Возвращает Record всех Route'ов зарегистрированных в системе роутинга на данный момент.
 * @function
 * @name Router/_private/Data#getRegisteredRoutes
 * @returns {Object}
 * @private
 */
export function getRegisteredRoutes(): Record<string, IRegisteredRoute> {
    return _getField('registeredRoutes');
}

/*
 * Get the Record of all References currently registered by Router
 * @function
 * @name Router/_private/Data#getRegisteredReferences
 * @returns {Object}
 * @private
 */
/**
 * Возвращает Record всех Reference'ов зарегистрированных в системе роутинга на данный момент.
 * @function
 * @name Router/_private/Data#getRegisteredReferences
 * @returns {Object}
 * @private
 */
export function getRegisteredReferences(): Record<string, IRegisteredReference> {
    return _getField('registeredReferences');
}

/*
 * Get the instance of Application/Core if it exists on the page
 * @function
 * @name Router/_private/Data#getCoreInstance
 * @returns {Controls/Application/Core}
 * @private
 */
/**
 * Возвращает экземпляр Application/Core, если он существует на странице.
 * @function
 * @name Router/_private/Data#getCoreInstance
 * @returns {Controls/Application/Core}
 * @private
 */
export function getCoreInstance(): ICoreInstance {
    return StoreManager.getCoreInstance();
}

function _initNewStorage(storage: IRouterData): void {
    const currentUrl: string = _calculateRelativeUrl();
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
    const storage: IRouterData = StoreManager.getRouterStore();
    if (!storage || (storage && !storage.IS_ROUTER_STORAGE)) {
        _initNewStorage(storage);
    }
    return storage;
}

function _calculateRelativeUrl(): string {
    const location: ILocation = StoreManager.getLocation();

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
    const storage: IRouterData = _getStorage();
    return (storage[fieldName] = value);
}
