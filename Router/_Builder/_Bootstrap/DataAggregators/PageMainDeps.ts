import { addPageDeps } from 'UI/Deps';
import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';

export class PageMainDeps implements IDataAggregatorModule {
    execute(): Partial<IFullData> | null {
        // все модули из зависимостей стартового скрипта должны быть добавлены в зависимости страницы,
        // чтобы они добавились в тело страницы в виде пакета или отдельного модуля (в зависимости от сборки)
        const deps = [
            'Env/Env',
            'Application/Initializer',
            'Application/Env',
            'SbisUI/Wasaby',
            'UI/Base',
            'UI/State',
            'Application/State',
            'Router/router',
            'SbisUI/polyfill',
            'WasabyLoader/ModulesLoader',
        ];

        addPageDeps(deps);
        return null;
    }
}
