import {
    IFullData,
    IDataAggregatorModule,
    IDataAggregatorPreModule,
    IBuilderModuleDeps,
} from './Interface';
import { collectDependencies, ICollectedDeps } from 'UI/Deps';

export class DataAggregator {
    /**
     * Аггрегаторы, которые будут вызваны в getData в самом начале, до вызова сбора зависимостей
     */
    private _preModules: IDataAggregatorPreModule[] = [];

    protected _modules: IDataAggregatorModule[] = [];

    /**
     * DataAggregator не хранит опции — каждый агрегатор получает нужные ему опции через конструктор.
     * @param pageId идентификатор страницы для сбора зависимостей. Вычисляется в appAliasGetter
     */
    constructor(protected _pageId?: string) {}

    addPre(module: IDataAggregatorPreModule): DataAggregator {
        this._preModules.push(module);
        return this;
    }

    add(module: IDataAggregatorModule): DataAggregator {
        this._modules.push(module);
        return this;
    }

    /**
     * @param totalResult признак того, что нужно получить все зависимости страницы, включая результат сериализации.
     *                  при потоковом построении будет многократный вызов метода
     *                  и результаты этих вызовов в сумме должны давать уникальный набор зависимостей страницы
     * @param staticPageBundles мета информация (bundlesRoute и module-dependencies) от билдера при генерации
     *                  статичных страниц. Этот аргумент используется при генерации статичных страниц *html.tmpl
     */
    getData(
        totalResult: boolean = true,
        staticPageBundles?: IBuilderModuleDeps
    ): Partial<IFullData> {
        let result = this.executePreModules();

        const deps = collectDependencies(staticPageBundles, totalResult, this._pageId);

        result = { ...result, ...this.executeModules(deps) };

        return result;
    }

    protected executePreModules(): Partial<IFullData> {
        let result: Partial<IFullData> = {};
        this._preModules.forEach((module) => {
            result = {
                ...result,
                ...(module.execute() || {}),
            };
        });
        this._preModules = [];
        return result;
    }

    protected executeModules(deps: ICollectedDeps): Partial<IFullData> {
        let result: Partial<IFullData> = {};
        this._modules.forEach((module) => {
            result = {
                ...result,
                ...(module.execute(deps) || {}),
            };
        });
        this._modules = [];
        return result;
    }
}
