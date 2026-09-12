import { addPageDeps } from 'UI/Deps';
import { IDataAggregatorPreModule, IFullData } from '../Interface';

export const MAIN_DEPS = [
    'Env/Constants',
    'UI/Start',
    'Router/router',
    'SbisUI/polyfill',
    'WasabyLoader/ModulesLoader',
];

/**
 * Агрегатор, который добавляет в head базовые модули для оживления на клиенте.
 * Все модули из зависимостей стартового скрипта должны быть добавлены в зависимости страницы,
 * чтобы они добавились в тело страницы в виде пакета или отдельного модуля (в зависимости от сборки)
 * @private
 */
export class PageMainDeps implements IDataAggregatorPreModule {
    execute(): Partial<IFullData> | null {
        addPageDeps(MAIN_DEPS);
        return null;
    }
}
