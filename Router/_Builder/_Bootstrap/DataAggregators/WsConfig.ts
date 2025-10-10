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

        return null;
    }
}
