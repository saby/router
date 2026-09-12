import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { createDefaultTags } from 'UI/Head';

export class DefaultTags implements IDataAggregatorModule {
    execute(options: IRenderOptions): Partial<IFullData> | null {
        // @ts-ignore react-19-enable
        createDefaultTags(options);

        return null;
    }
}
