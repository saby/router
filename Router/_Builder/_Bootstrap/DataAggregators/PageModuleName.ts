import { addPageDeps } from 'UI/Deps';
import { IDataAggregatorPreModule, IFullData } from '../Interface';

/**
 * Агрегатор, который добавляет модуль Index страницы в список зависимостей.
 * @private
 */
export class PageModuleName implements IDataAggregatorPreModule {
    constructor(private moduleName?: string) {}

    execute(): Partial<IFullData> | null {
        if (this.moduleName) {
            addPageDeps([this.moduleName]);
        }
        return null;
    }
}
