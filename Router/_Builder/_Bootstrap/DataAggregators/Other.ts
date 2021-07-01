/// <amd-module name="Router/_Builder/_Bootstrap/DataAggregators/Other" />

import { IDataAggregatorModule, ICollectedDeps, IRenderOptions, IFullData } from 'Router/_Builder/_Bootstrap/Interface';

export class Other implements IDataAggregatorModule {
    execute(deps: ICollectedDeps, options?: IRenderOptions): Partial<IFullData> | null {
        return {
            requiredModules: deps.additionalDeps,
            isCanceledRevive: options.isCanceledRevive
        };
    }
}
