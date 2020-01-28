/// <amd-module name="Router/_private/StoreManager" />

import * as AppInit from 'Application/Initializer';
import * as AppEnv from 'Application/Env';
import { ILocation, IStore } from 'Application/Interface';
import { IRouterData, IRegisteredRoute, IRegisteredReference, IHistoryState } from 'Router/_private/Data';

const STORAGE_KEY = 'RouterData';
const CORE_INSTANCE_KEY = 'CoreInstance';

export interface ICoreInstance {
    changeApplicationHandler: (e: Event, newAppName: string) => boolean;
}

/**
 * Класс-заглушка на случай, если нету VDOM или если код выполняется на сервисе представления
 * @class Router/_private/StoreManager#FakeStore
 * @public
 * @author Черваков Д.В.
 */
class FakeStore implements IStore<Record<string, string>> {
    private _store: Record<string, string> = {};

    get(key: string): string {return this._store[key]; }

    set( key: string, value: string ): boolean {
        try {
            this._store[key] = value;
            return true;
        } catch (error) {
            return false;
        }
    }

    remove( key: string ): void {
        delete this._store[key];
    }
    getKeys(): string[] {
        return Object.keys(this._store);
    }
    toObject(): { [x: string]: string; } {
        return Object.assign({}, this._store);
    }
}

/**
 * Класс-обертка над IStore. Реализует интерфейс IRouterData
 * @class Router/_private/StoreManager#RouterData
 * @public
 * @author Черваков Д.В.
 */
class RouterData implements IRouterData {

    // коллбэки, которые не получится хранить в сторе
    registeredRoutes: Record<string, IRegisteredRoute>;
    registeredReferences: Record<string, IRegisteredReference>;
    coreInstance?: ICoreInstance;

    // данные из стора
    private _IS_ROUTER_STORAGE: boolean;
    private _history: IHistoryState[];
    private _historyPosition: number;
    private _relativeUrl: string;

    constructor(private _storage: IStore<Record<string, string>>) {
        const initState = _storage.toObject ? _storage.toObject() : {};
        initState.history = initState.history ? JSON.parse(initState.history) : {};
        Object.assign(this, initState);
    }

    get IS_ROUTER_STORAGE(): boolean { return this._IS_ROUTER_STORAGE; }

    set IS_ROUTER_STORAGE(val: boolean) {
        this._IS_ROUTER_STORAGE = val;
        this._storage.set('IS_ROUTER_STORAGE', val.toString());
    }

    get history(): IHistoryState[] { return this._history; }

    set history(val: IHistoryState[]) {
        this._history = val;
        this._storage.set('history', JSON.stringify(val));
    }

    get historyPosition(): number { return this._historyPosition; }

    set historyPosition(val: number) {
        this._historyPosition = val;
        this._storage.set('historyPosition', '' + val);
    }

    get relativeUrl(): string { return this._relativeUrl; }

    set relativeUrl(val: string) {
        this._relativeUrl = val;
        this._storage.set('relativeUrl', '' + val);
    }
}

/**
 * Класс-менеджер хранилища
 * @class Router/_private/StoreManager
 * @public
 * @author Черваков Д.В.
 */
class StoreManager {

    private _routerData: RouterData;

    constructor() {
        let routerStorage: IStore<Record<string, string>>;

        if (AppInit.isInit()) {
            // AppEnv storages exist on the new pages built with
            // Application/Core, we store Router data there if
            // possible (if the application is initialized)
            routerStorage = AppEnv.getStore(STORAGE_KEY);
        } else if (typeof window !== 'undefined') {
             // If the application is not initialized, this means that
            // Router is used on the old page without Application/Core.
            // It is possible for Route to be used inside of a Wasaby
            // popup for example. In this case, return a fake storage
            routerStorage = new FakeStore();
        } else {
            // If the old page is built on server, it can't have
            // Router components on it (they can only exist inside
            // popups or sections created by createControl on the
            // client side). Return empty object instead of the
            routerStorage = new FakeStore();
        }

        this._routerData = new RouterData(routerStorage);
    }

    getLocation(): ILocation {
        if (AppInit.isInit()) {
            return AppEnv.location;
        } else if (typeof window !== 'undefined') {
            return window.location;
        } else {
            return null;
        }
    }

    getRouterStore(): RouterData {
        return this._routerData;
    }

    getCoreInstance(): ICoreInstance {
        if (AppInit.isInit()) {
            const storage = AppEnv.getStore<Record<string, unknown>>(CORE_INSTANCE_KEY).toObject();
            return storage && storage.instance as ICoreInstance;
        }
        return null;
    }
}

const Instance = new StoreManager();

export default Instance;
