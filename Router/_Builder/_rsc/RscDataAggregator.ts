import { addPageDeps, collectDependencies, ICollectedDeps } from 'UI/Deps';
import { MAIN_DEPS } from '../_Bootstrap/DataAggregators/PageMainDeps';
import { IFullData, IBuilderModuleDeps, IDataAggregatorModule } from '../_Bootstrap/Interface';
import { DataAggregator } from '../_Bootstrap/DataAggregator';

export class RscDataAggregator extends DataAggregator {
    /**
     * Аггрегаторы, которые были отложены, т.к. не было js зависимостей и не стали добавлять другой js в страницу
     */
    private _deferredModules: IDataAggregatorModule[] = [];

    getData(
        totalResult: boolean = true,
        staticPageBundles?: IBuilderModuleDeps
    ): Partial<IFullData> {
        let result = this.executePreModules();

        let deps = collectDependencies(staticPageBundles, totalResult, this._pageId, true);

        if (this._hasJSDeps(deps)) {
            addPageDeps(MAIN_DEPS);
            const additionalDeps = collectDependencies(
                staticPageBundles,
                totalResult,
                this._pageId,
                true
            );
            deps = {
                js: [...new Set([...deps.js, ...additionalDeps.js])],
                css: {
                    simpleCss: [
                        ...new Set([...deps.css.simpleCss, ...additionalDeps.css.simpleCss]),
                    ],
                    themedCss: [
                        ...new Set([...deps.css.themedCss, ...additionalDeps.css.themedCss]),
                    ],
                },
                tmpl: [...new Set([...deps.tmpl, ...additionalDeps.tmpl])],
                wml: [...new Set([...deps.wml, ...additionalDeps.wml])],
                rsSerialized: deps.rsSerialized,
                requiredModules: [
                    ...new Set([
                        ...(deps.requiredModules ?? []),
                        ...(additionalDeps.requiredModules ?? []),
                    ]),
                ],
                /**
                 * список модулей, которые были запрошены в текущем этапе потокового построения
                 */
                requireList: [
                    ...new Set([
                        ...(deps.requireList ?? []),
                        ...(additionalDeps.requireList ?? []),
                    ]),
                ],
                // признак того, что используются pagex-пакеты ресурсов
                pagexPackages: deps.pagexPackages,
            };
        }

        result = { ...result, ...this._executeModules(deps) };

        return result;
    }

    protected _executeModules(deps: ICollectedDeps): Partial<IFullData> {
        let result: Partial<IFullData> = {};
        const hasJSDeps = this._hasJSDeps(deps);
        const modules = [...this._deferredModules, ...this._modules];
        this._deferredModules = [];
        this._modules = [];
        const deferred: IDataAggregatorModule[] = [];
        modules.forEach((module) => {
            if (module.addsScripts === true && !hasJSDeps) {
                deferred.push(module);
                return;
            }
            result = {
                ...result,
                ...(module.execute(deps) || {}),
            };
        });
        this._deferredModules = deferred;
        return result;
    }

    private _hasJSDeps(deps: ICollectedDeps): boolean {
        return (
            deps.js.length > 0 ||
            (deps.requireList?.length ?? 0) > 0 ||
            (deps.requiredModules?.length ?? 0) > 0
        );
    }
}
