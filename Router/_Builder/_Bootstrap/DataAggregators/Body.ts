import { Body as AppBody } from 'Application/Page';
import {
    IDataAggregatorModule,
    ICollectedDeps,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';

export class Body implements IDataAggregatorModule {
    execute(
        deps: ICollectedDeps,
        options?: IRenderOptions
    ): Partial<IFullData> | null {
        const BodyAPI = AppBody.getInstance();

        return {
            BodyAPIClasses: BodyAPI.getClassString(),
            directionality: BodyAPI.getDir(),
        };
    }
}
