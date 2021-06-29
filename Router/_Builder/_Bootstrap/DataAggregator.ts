/// <amd-module name="Router/_Builder/_Bootstrap/DataAggregator" />

import { IFullData, IRenderOptions, IDataAggregatorModule } from './Interface';
import { addPageDeps, headDataStore } from 'UICommon/Deps';

export class DataAggregator {
    private _modules: IDataAggregatorModule[];

    constructor(private _moduleName: string, private _options: IRenderOptions) {}

    add(module: IDataAggregatorModule): DataAggregator {
        this._modules.push(module);

        return this;
    }

    getData(): Partial<IFullData> {
        addPageDeps([this._moduleName]);
        const deps = headDataStore.read('collectDependencies')();

        let result = {};

        this._modules.forEach((module) => {
            result = {...result, ...(module.execute(deps, this._options) || {})};
        });

        return result;
    }
}
