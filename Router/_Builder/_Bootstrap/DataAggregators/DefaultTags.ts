import {
    IDataAggregatorModule,
    ICollectedDeps,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { createDefaultTags } from 'UI/Head';

export class DefaultTags implements IDataAggregatorModule {
    execute(
        deps: ICollectedDeps,
        options?: IRenderOptions
    ): Partial<IFullData> | null {
        createDefaultTags(options);

        return null;
    }
}
