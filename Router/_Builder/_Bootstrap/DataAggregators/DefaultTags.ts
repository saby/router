import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { ICollectedDeps } from 'UI/Deps';
import { createDefaultTags } from 'UI/Head';

export class DefaultTags implements IDataAggregatorModule {
    constructor(private noscript?: string) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        createDefaultTags({ noscript: this.noscript });

        return null;
    }
}
