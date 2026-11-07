import * as AppEnv from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import * as UIHead from 'UI/Head';
import { HeadMainScripts } from 'Router/_Builder/_Bootstrap/DataAggregators/HeadMainScripts';
import getReactMode from 'Router/_Builder/getReactMode';
import { DataAggregator } from 'Router/_Builder/_Bootstrap/DataAggregator';

describe('React mode', () => {
    const store = new Map();

    beforeEach(() => {
        store.clear();
        jest.spyOn(AppEnv.cookie, 'get').mockReturnValue(null);
        jest.spyOn(AppEnv, 'getStore').mockReturnValue(store as never);

        jest.spyOn(UIHead, 'createWsConfig').mockImplementation();
        jest.spyOn(AppHead, 'getInstance').mockReturnValue({
            createMergeTag: jest.fn(),
        } as unknown as AppHead);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function setLocation(url: string): void {
        jest.spyOn(AppEnv.location, 'href', 'get').mockReturnValue(url);
        jest.spyOn(AppEnv.location, 'host', 'get').mockReturnValue(new URL(url).host);
    }

    test.each([
        'https://test-online.saby.ru/page/demo-card-font',
        'https://dev-online.saby.ru/page/demo-card-font',
    ])('loads debug React for %s', (url) => {
        setLocation(url);
        new HeadMainScripts({} as never).execute();

        expect(UIHead.createWsConfig).toHaveBeenCalledWith(
            expect.objectContaining({ reactMode: 'debug' }),
        );
    });

    test.each(['true', 'Controls', 'false', null])(
        'disableDebugModeForPerformanceCalc wins over s3debug=%s',
        (debugCookie) => {
            setLocation('https://test-online.saby.ru/page/demo-card-font');
            jest.spyOn(AppEnv.cookie, 'get').mockImplementation((name) => {
                return name === 'disableDebugModeForPerformanceCalc' ? 'true' : debugCookie;
            });

            new HeadMainScripts({} as never).execute();

            expect(UIHead.createWsConfig).toHaveBeenCalledWith(
                expect.objectContaining({ reactMode: 'release' }),
            );
        },
    );

    test('false does not disable debug React', () => {
        setLocation('https://test-online.saby.ru/page/demo-card-font');
        jest.spyOn(AppEnv.cookie, 'get').mockReturnValue('false');

        expect(getReactMode()).toBe('debug');
    });

    test.each([
        'https://online.saby.ru/page/demo-card-font?next=autotest',
        'http://psdr-prognix31.corp.tensor.ru:30010/page/demo-card-font',
        'http://autotest.corp.tensor.ru/page/demo-card-font',
        'http://localhost:777/DemoStand',
        'http://psdr-prognix31.corp.tensor.ru:30010/DemoStand',
    ])('uses the default mode for %s', (url) => {
        setLocation(url);

        expect(getReactMode()).toBe('default');
    });

    test('uses the same mode in HTML configuration and dependency collection', () => {
        setLocation('https://test-online.saby.ru/page/demo-card-font');
        const collectDependencies = jest.fn().mockReturnValue({});

        new HeadMainScripts({} as never).execute();
        new DataAggregator('demo-card-font', collectDependencies).getData();

        expect(UIHead.createWsConfig).toHaveBeenCalledWith(
            expect.objectContaining({ reactMode: 'debug' }),
        );
        expect(collectDependencies).toHaveBeenCalledWith({
            totalResult: true,
            pageId: 'demo-card-font',
            reactMode: 'debug',
        });
    });
});
