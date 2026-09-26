import { addPageDeps, collectDependencies, ICollectedDeps } from 'UI/Deps';
import { MAIN_DEPS } from '../_Bootstrap/DataAggregators/PageMainDeps';
import { IFullData, IDataAggregatorModule } from '../_Bootstrap/Interface';
import { DataAggregator } from '../_Bootstrap/DataAggregator';
import getReactMode from '../getReactMode';

export class RscDataAggregator extends DataAggregator {
    /**
     * Аггрегаторы, которые были отложены, т.к. не было js зависимостей и не стали добавлять другой js в страницу
     */
    private _deferredModules: IDataAggregatorModule[] = [];

    getData(totalResult: boolean = true): Partial<IFullData> {
        let result = this.executePreModules();

        let deps = collectDependencies({
            totalResult,
            pageId: this._pageId,
            reactMode: getReactMode(),
            isRSC: true,
        });

        if (this._hasJSDeps(deps)) {
            addPageDeps(MAIN_DEPS);
            const additionalDeps = collectDependencies({
                totalResult,
                pageId: this._pageId,
                reactMode: getReactMode(),
                isRSC: true,
            });
            deps = {
                scripts: new Set([...deps.scripts, ...additionalDeps.scripts]),
                links: new Set([...deps.links, ...additionalDeps.links]),
                rsSerialized: deps.rsSerialized,
                requiredModules: [
                    ...new Set([
                        ...(deps.requiredModules ?? []),
                        ...(additionalDeps.requiredModules ?? []),
                    ]),
                ],
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
        return deps.scripts.size > 0 || (deps.requiredModules?.length ?? 0) > 0;
    }
}
