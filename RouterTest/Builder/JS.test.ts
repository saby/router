import type { ICollectedDeps } from 'UI/Deps';
import { JS } from 'Router/_Builder/_Bootstrap/DataAggregators/JS';

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

describe('Router/_Builder/_Bootstrap/DataAggregators/JS', () => {
    test('isEnd=true без клиентских модулей не добавляет стартовый скрипт', () => {
        const result = new JS().execute(createDeps());
        expect(result).toBeNull();
    });

    test('isEnd=true с клиентскими модулями добавляет стартовый скрипт', () => {
        const result = new JS().execute(createDeps({ requiredModules: ['App'] }));
        expect(result).not.toBeNull();
    });

    test('isEnd=false выполняется даже без JS-зависимостей', () => {
        const result = new JS(false).execute(createDeps());
        expect(result).not.toBeNull();
    });
});
