import { IFullData, IRenderOptions, IDataAggregatorModule, IBuilderExtraInfo } from './Interface';
import { addPageDeps, collectDependencies } from 'UI/Deps';

export class DataAggregator {
    private _modules: IDataAggregatorModule[] = [];

    constructor(
        private _options: IRenderOptions,
        private _moduleName?: string
    ) {}

    add(module: IDataAggregatorModule): DataAggregator {
        this._modules.push(module);

        return this;
    }

    /**
     * @param extraInfo мета информация (bundlesRoute и module-dependencies) от билдера при генерации
     *                  статичных страниц. Этот аргумент используется при генерации статичных страниц *html.tmpl
     * @param totalResult признак того, что нужно получить все зависимости страницы, включая результат сериализации.
     *                  при потоковом построении будет многократный вызов метода
     *                  и результаты этих вызовов в сумме должны давать уникальный набор зависимостей страницы
     */
    getData(extraInfo?: IBuilderExtraInfo, totalResult: boolean = true): Partial<IFullData> {
        if (this._moduleName) {
            addPageDeps([this._moduleName]);
        }

        let staticPageBundles;
        if (extraInfo && extraInfo.moduleDependencies && extraInfo.bundlesRoute) {
            staticPageBundles = {
                links: extraInfo.moduleDependencies.links,
                nodes: extraInfo.moduleDependencies.nodes,
                bundles: extraInfo.bundlesRoute,
            };
        }
        const deps = collectDependencies(staticPageBundles, totalResult, this._options.pageId);

        let result = {};

        this._modules.forEach((module) => {
            result = {
                ...result,
                ...(module.execute(this._options, deps) || {}),
            };
        });

        return result;
    }
}
