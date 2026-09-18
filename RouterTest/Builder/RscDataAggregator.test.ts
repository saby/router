import type { ICollectedDeps } from 'UI/Deps';
import type { IDataAggregatorModule } from 'Router/_Builder/_Bootstrap/Interface';

import * as Deps from 'UI/Deps';
import { MAIN_DEPS } from 'Router/_Builder/_Bootstrap/DataAggregators/PageMainDeps';
import { RscDataAggregator } from 'Router/_Builder/_rsc/RscDataAggregator';

class AddsScriptsModule implements IDataAggregatorModule {
    readonly addsScripts: boolean = true;

    execute: jest.Mock<null, [ICollectedDeps]> = jest.fn(() => null);
}

class PlainModule implements IDataAggregatorModule {
    execute: jest.Mock<null, [ICollectedDeps]> = jest.fn(() => null);
}

function createDeps(overrides: Partial<ICollectedDeps> = {}): ICollectedDeps {
    return {
        js: [],
        css: { simpleCss: [], themedCss: [] },
        tmpl: [],
        wml: [],
        requireList: [],
        ...overrides,
    };
}

describe('Router/_Builder/_rsc/RscDataAggregator', () => {
    let aggregator: RscDataAggregator;
    let collectDependenciesSpy: jest.SpyInstance;
    let addPageDepsSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.restoreAllMocks();
        collectDependenciesSpy = jest
            .spyOn(Deps, 'collectDependencies')
            .mockReturnValue(createDeps());
        addPageDepsSpy = jest.spyOn(Deps, 'addPageDeps').mockImplementation(() => {});
        aggregator = new RscDataAggregator();
    });

    test('не выполняет addsScripts-агрегаторы, пока нет JS-зависимостей', () => {
        const addsScripts = new AddsScriptsModule();
        const plain = new PlainModule();
        aggregator.add(addsScripts).add(plain);

        aggregator.getData(false);

        expect(addsScripts.execute).not.toHaveBeenCalled();
        expect(plain.execute).toHaveBeenCalledTimes(1);
        expect(addPageDepsSpy).not.toHaveBeenCalled();
    });

    test('выполняет отложенные addsScripts-агрегаторы при первом появлении JS-зависимостей', () => {
        const addsScripts = new AddsScriptsModule();
        aggregator.add(addsScripts);
        aggregator.getData(false);
        expect(addsScripts.execute).not.toHaveBeenCalled();

        collectDependenciesSpy.mockReturnValue(
            createDeps({ js: ['App.js'], requireList: ['App'] })
        );
        aggregator.getData(false);

        expect(addsScripts.execute).toHaveBeenCalledTimes(1);
        expect(addPageDepsSpy).toHaveBeenCalledWith(MAIN_DEPS);
    });

    test('выполняет отложенные addsScripts-агрегаторы до модулей текущего этапа', () => {
        const addsScripts = new AddsScriptsModule();
        const order: string[] = [];
        addsScripts.execute = jest.fn(() => {
            order.push('addsScripts');
            return null;
        });
        aggregator.add(addsScripts);
        aggregator.getData(false);

        collectDependenciesSpy.mockReturnValue(
            createDeps({ js: ['App.js'], requireList: ['App'] })
        );
        const plain = new PlainModule();
        plain.execute = jest.fn(() => {
            order.push('plain');
            return null;
        });
        aggregator.add(plain);
        aggregator.getData(false);

        expect(order).toEqual(['addsScripts', 'plain']);
    });

    test('не выполняет отложенный addsScripts-агрегатор повторно при позднем появлении JS', () => {
        const addsScripts = new AddsScriptsModule();
        const plain = new PlainModule();
        aggregator.add(addsScripts).add(plain);
        aggregator.getData(false);
        aggregator.getData(false);

        collectDependenciesSpy.mockReturnValue(
            createDeps({ js: ['App.js'], requireList: ['App'] })
        );
        aggregator.getData(false);

        expect(addsScripts.execute).toHaveBeenCalledTimes(1);
        expect(plain.execute).toHaveBeenCalledTimes(1);
    });
});
