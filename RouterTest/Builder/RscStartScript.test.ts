import { runInNewContext } from 'vm';
import { getRscStartScript } from 'Router/_Builder/_Bootstrap/html/_startScript/rsc';
import { getDefaultStartScript } from 'Router/_Builder/_Bootstrap/html/_startScript/default';

/** Выполняет стартовый скрипт до запроса модулей у загрузчика. */
function getRequestedModules(script: string): string[] | undefined {
    const requireMock = jest.fn();
    const windowMock = { startScript: undefined as undefined | (() => void) };
    runInNewContext(script.replace(/<\/?script\b[^>]*>/g, ''), {
        window: windowMock,
        document: { querySelector: () => null, addEventListener: jest.fn() },
        require: requireMock,
    });
    windowMock.startScript?.();
    return requireMock.mock.calls[0]?.[0];
}

describe('стартовые зависимости RSC', () => {
    test('страница без клиентских зависимостей не запускает загрузку JS', () => {
        expect(getRequestedModules(getRscStartScript([]))).toBeUndefined();
        expect(getRequestedModules(getRscStartScript(undefined))).toBeUndefined();
    });

    test('React-остров запускается без общего Wasaby-старта и SPA-роутера', () => {
        expect(getRequestedModules(getRscStartScript(['App/Island']))).toEqual([
            'react-dom/client',
            'UICore/_rsc/client/rsc-client',
            'Env/Constants',
            'WasabyLoader/ModulesLoader',
            'App/Island',
        ]);
    });

    test('сохраняет зависимости островов и не дублирует стартовые модули', () => {
        expect(
            getRequestedModules(
                getRscStartScript([
                    'App/Island',
                    'UI/Start',
                    'Router/router',
                    'react-dom/client',
                    'UICore/_rsc/client/rsc-client',
                    'Env/Constants',
                    'WasabyLoader/ModulesLoader',
                ])
            )
        ).toEqual([
            'react-dom/client',
            'UICore/_rsc/client/rsc-client',
            'Env/Constants',
            'WasabyLoader/ModulesLoader',
            'App/Island',
            'UI/Start',
            'Router/router',
        ]);
    });

    test('обычный запуск сохраняет Wasaby-старт и SPA-роутер', () => {
        expect(
            getRequestedModules(
                getDefaultStartScript(['App', 'UI/Start', 'Router/router', 'Env/Constants'], true)
            )
        ).toEqual([
            'Env/Constants',
            'UI/Start',
            'Router/router',
            'WasabyLoader/ModulesLoader',
            'App',
        ]);
    });
});
