import { initScript } from 'RequireJsLoader/bootstrap';
import { Head as AppHead } from 'Application/Page';
import { createWsConfig } from 'UI/Head';
import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';

export class WsConfig implements IDataAggregatorModule {
    execute(options: IRenderOptions, deps: ICollectedDeps): Partial<IFullData> | null {
        // прокинем опцию pagexPackages, чтобы оно попало в wsConfig
        createWsConfig({ ...options, pagexPackages: deps.pagexPackages });

        const HeadAPI = AppHead.getInstance();
        HeadAPI.createMergeTag('script', {}, initScript);

        return null;
    }
}
