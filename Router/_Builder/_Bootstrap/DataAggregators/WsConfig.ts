import { initScript } from 'RequireJsLoader/bootstrap';
import { Head as AppHead } from 'Application/Page';
import { setConfig, location, cookie } from 'Application/Env';
import { createWsConfig } from 'UI/Head';
import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IFullData,
    IRenderOptions,
} from 'Router/_Builder/_Bootstrap/Interface';
import { onloadDescr } from './onloadScript';
import { blacklist } from './blacklistForDebug';
import { prepareScript } from '../html/prepareScript';

export class WsConfig implements IDataAggregatorModule {
    readonly addsScripts: boolean = true;

    constructor(
        private options: IRenderOptions,
        private isStatelessPage: boolean = false
    ) {}

    execute(deps: ICollectedDeps): Partial<IFullData> | null {
        // прокинем опцию pagexPackages, чтобы оно попало в wsConfig
        createWsConfig({
            ...this.options,
            pagexPackages: deps.pagexPackages,
            isDebugReact: this.isTestEnv(),
            isStatelessPage: this.isStatelessPage,
        });

        const HeadAPI = AppHead.getInstance();
        const _initScript = prepareScript(initScript);
        HeadAPI.createMergeTag('script', {}, _initScript);

        HeadAPI.createMergeTag('script', {}, onloadDescr);

        return null;
    }

    private isTestEnv(): boolean {
        const pathname = location.pathname.replace(/\/$/, '').replace(/%2f/gi, '/');
        const isDebugMode =
            typeof window === 'undefined' &&
            !blacklist[pathname] &&
            !((cookie.get('disableDebugModeForPerformanceCalc') as string) === 'true') &&
            (location.href.indexOf('DemoStand') !== -1 ||
                location.href.indexOf('autotest') !== -1 ||
                location.href.indexOf('prognix') !== -1 ||
                location.href.indexOf('dev-online') !== -1 ||
                location.href.indexOf('test-online') !== -1);
        setConfig('isDebugReact', isDebugMode);
        return isDebugMode;
    }
}

/**
 * wsConfig для демки require
 */
export class EmptyDemoWsConfig implements IDataAggregatorModule {
    constructor(private options: IRenderOptions) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        createWsConfig(this.options);

        const HeadAPI = AppHead.getInstance();
        const _initScript = prepareScript(initScript);
        HeadAPI.createMergeTag('script', {}, _initScript);

        return null;
    }
}
