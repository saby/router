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
 * @author Санников К.А.
 */
class FakeStore implements IStore<Record<string, unknown>> {
    private _store: Record<string, unknown> = {};

    get(key: string): unknown {return this._store[key]; }

    set( key: string, value: unknown ): boolean {
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
    toObject(): { [x: string]: unknown; } {
        return Object.assign({}, this._store);
    }
}

/**
 * Класс-обертка над IStore. Реализует интерфейс IRouterData
 * @class Router/_private/StoreManager#RouterData
 * @public
 * @author Санников К.А.
 */
class RouterData implements IRouterData {

    constructor(private _storage: IStore<Record<string, unknown>>) {
    }

    get IS_ROUTER_STORAGE(): boolean { return <boolean>this._storage.get('IS_ROUTER_STORAGE')}

    set IS_ROUTER_STORAGE(val: boolean) {
        this._storage.set('IS_ROUTER_STORAGE', val);
    }

    get history(): IHistoryState[] { return <IHistoryState[]>this._storage.get('history'); }

    set history(val: IHistoryState[]) {
        this._storage.set('history', val);
    }

    get historyPosition(): number {
        // const radix = 10;
        return <number>this._storage.get('historyPosition');
    }

    set historyPosition(val: number) {
        this._storage.set('historyPosition', val);
    }

    get relativeUrl(): string {
        return <string>this._storage.get('relativeUrl');
     }

    set relativeUrl(val: string) {
        this._storage.set('relativeUrl', val);
    }

    get registeredRoutes(): Record<string, IRegisteredRoute> {
        return <Record<string, IRegisteredRoute>>this._storage.get('registeredRoutes');
    }

    set registeredRoutes(val: Record<string, IRegisteredRoute>) {
        this._storage.set('registeredRoutes', val);
    }

    get registeredReferences(): Record<string, IRegisteredReference> {
        return <Record<string, IRegisteredReference>>this._storage.get('registeredReferences');
    }

    set registeredReferences(val: Record<string, IRegisteredReference>) {
        this._storage.set('registeredReferences', val);
    }

    get coreInstance(): ICoreInstance {
        return <ICoreInstance>this._storage.get('coreInstance');
    }

    set coreInstance(val: ICoreInstance) {
        this._storage.set('coreInstance', val);
    }
}

/**
 * Класс-менеджер хранилища
 * @class Router/_private/StoreManager
 * @public
 * @author Санников К.А.
 */
class StoreManager {

    private _fakeStore:FakeStore = new FakeStore();
    private _routerData: RouterData;

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
        let routerStorage: IStore<Record<string, unknown>>;

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
            routerStorage = this._fakeStore;
        } else {
            // If the old page is built on server, it can't have
            // Router components on it (they can only exist inside
            // popups or sections created by createControl on the
            // client side). Return empty object instead of the
            routerStorage = new FakeStore();
        }

        this._routerData = new RouterData(routerStorage);
        return this._routerData;
    }

    getCoreInstance(): ICoreInstance {
        if (AppInit.isInit()) {
            const storage: IStore<Record<string, unknown>> = AppEnv.getStore<Record<string, unknown>>(CORE_INSTANCE_KEY);
            return storage && storage['instance'] as ICoreInstance;
        }
        return null;
    }
}

const Instance: StoreManager = new StoreManager();

export default Instance;
