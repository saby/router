/// <amd-module name="Router/_private/StoreManager" />

import * as AppInit from 'Application/Initializer';
import * as AppEnv from 'Application/Env';
import { IStore, ILocation } from 'Application/Interface';

const STORAGE_KEY = 'RouterData';
const CORE_INSTANCE_KEY = 'CoreInstance';

class StoreManager {
    private _fakeStorage: any = {};

    getLocation(): ILocation {
        if (AppInit.isInit()) {
            return AppEnv.location;
        } else if (typeof window !== 'undefined') {
            return window.location;
        } else {
            return null;
        }
    }

    getRouterStore(): IStore<string> | Record<string, unknown> {
        if (AppInit.isInit()) {
            // AppEnv storages exist on the new pages built with
            // Application/Core, we store Router data there if
            // possible (if the application is initialized)
            return AppEnv.getStore(STORAGE_KEY);
        } else if (typeof window !== 'undefined') {
            // If the application is not initialized, this means that
            // Router is used on the old page without Application/Core.
            // It is possible for Route to be used inside of a Wasaby
            // popup for example. In this case, return a fake storage
            return this._fakeStorage;
        } else {
            // If the old page is built on server, it can't have
            // Router components on it (they can only exist inside
            // popups or sections created by createControl on the
            // client side). Return empty object instead of the
            // storage
            return {};
        }
    }

    getCoreInstance(): any {
        if (AppInit.isInit()) {
            const storage: any = AppEnv.getStore(CORE_INSTANCE_KEY);
            return storage && storage.instance;
        }
        return null;
    }
}

const Instance = new StoreManager();

export default Instance;
