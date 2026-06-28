import { initScript } from 'RequireJsLoader/bootstrap';
import { Head as AppHead } from 'Application/Page';
import { setConfig, location } from 'Application/Env';
import { createWsConfig } from 'UI/Head';
import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { cookie } from 'Env/Env';
import { onloadDescr } from './onloadScript';
import { blacklist } from './blacklistForDebug';
import { prepareScript } from '../html/prepareScript';

export class WsConfig implements IDataAggregatorModule {
    execute(options: IRenderOptions, deps: ICollectedDeps): Partial<IFullData> | null {
        // прокинем опцию pagexPackages, чтобы оно попало в wsConfig
        createWsConfig({
            ...options,
            pagexPackages: deps.pagexPackages,
            isDebugReact: this.isTestEnv(),
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
