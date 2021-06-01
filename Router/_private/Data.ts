/// <amd-module name="Router/_private/Data" />

/**
 * Набор методов для хранения состояний истории роутера
 * @module
 * @author Мустафин Л.И.
 * @public
 */

import { getConfig } from 'Application/Env';
import StoreManager from './StoreManager';

import * as UrlRewriter from './UrlRewriter';
import { ILocation } from 'Application/Interface';

/**
 * Одно состояние в истории браузера.
 * @interface Router/_private/Data/IHistoryState
 * @public
 */
export interface IHistoryState {
    /** Числовой идентификатор текущего состояния */
    id?: number;
    /** Действительный адрес, с которым работает роутинг */
    state: string;
    /** "Красивый" адрес, который отображается пользователю */
    href?: string;
}

export type TStateChangeFunction = (newLoc: IHistoryState, oldLoc: IHistoryState) => Promise<boolean> | boolean;

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
    relativeUrl: string;
}

export interface ISyntheticMouseEvent {
    preventDefault: () => void;
    nativeEvent: MouseEvent;
    routerReferenceNavigation?: boolean;
}

/*
 * Get the list of stored history states
 * @function
 * @returns {IHistoryState[]} list of history states
 */
/**
 * Возвращает список состояний истории роутера.
 * @function
 * @returns {IHistoryState[]} Список состояний истории.
 */
export function getHistory(): IHistoryState[] {
    return _getField('history');
}

/*
 * Replaces the list of stored history states.
 * @param {IHistoryState[]} Value new list of history states.
 * @hidden
 */
/**
 * Заменяет список состояний истории роутера
 * @param {IHistoryState[]} value Новый список состояний истории.
 * @hidden
 */
export function setHistory(value: IHistoryState[]): void {
    _setField('history', value);
}

/*
 * Get the index of the history state that is currently active
 * @function
 * @returns {Number} index of the active history state
 */
/**
 * Возвращает индекс активного в данный момент состояния истории
 * @function
 * @returns {Number} индекс активного состояния истории
 */
export function getHistoryPosition(): number {
    return _getField('historyPosition');
}

/*
 * Activates the history state with the specified index
 * @param {Number} value index of the state to activate
 * @hidden
 */
/**
 * Активирует состояние истории с заданным индексом
 * @param {Number} value индекс состояния, которое должно быть активировано
 * @hidden
 */
export function setHistoryPosition(value: number): void {
    _setField('historyPosition', value);
}

/**
 * Добавляет в начало переданного/текущего url-адреса префикс сервиса
 * @param url
 */
export function getRelativeUrlWithService(url?: string): string {
    let href: string = url || UrlRewriter.get(getRelativeUrl());
    let appRoot: string = getConfig('appRoot');
    if (appRoot && appRoot !== '/') {
        if (href.startsWith('/')) {
            href = href.substr(1);
        }
        if (!appRoot.endsWith('/')) {
            appRoot += '/';
        }
        return appRoot + href;
    }
    return href;
}

/*
 * @function Router/_private/Data#getRelativeUrl
 * Get the current "actual" URL that Router is working with
 * @returns {String} "actual" URL
 */
/**
 * Возвращает текущее значение действительного URL, с которым работает роутинг.
 * @function
 * @returns {String} действительный URL
 */
export function getRelativeUrl(): string {
    return _getField('relativeUrl') || _calculateRelativeUrl();
}

/*
 * Sets the value of "actual" URL
 * @param {String} value url to set
 * @hidden
 */
/**
 * Устанавливает значение текущего действительного URL.
 * @param {String} value значение для установки
 * @hidden
 */
export function setRelativeUrl(value: string): void {
    _setField('relativeUrl', value);
}

/*
 * @function
 * Get the current value of "pretty" URL that is displayed to the user
 * @returns {String} pretty url
 */
/**
 * Получить текущее значение "красивого" URL, отображаемого пользователю.
 * @function
 * @returns {String} Значение красивого URL.
 */
export function getVisibleRelativeUrl(): string {
    return _calculateRelativeUrl();
}

/*
 * Get the Record of all Routes currently registered by Router
 * @returns {Object}
 * @hidden
 */
/**
 * Возвращает Record всех Route'ов зарегистрированных в системе роутинга на данный момент.
 * @returns {Object}
 * @hidden
 */
export function getRegisteredRoutes(): Record<string, IRegisteredRoute> {
    return _getField('registeredRoutes');
}

/*
 * Get the Record of all References currently registered by Router
 * @returns {Object}
 * @hidden
 */
/**
 * Возвращает Record всех Reference'ов зарегистрированных в системе роутинга на данный момент.
 * @returns {Object}
 * @hidden
 */
export function getRegisteredReferences(): Record<string, IRegisteredReference> {
    return _getField('registeredReferences');
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
