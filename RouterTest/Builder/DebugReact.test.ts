import * as AppEnv from 'Application/Env';
import { Head as AppHead, JSLinks as AppJSLinks } from 'Application/Page';
import * as UIHead from 'UI/Head';
import { ICollectedDeps } from 'UI/Deps';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { JS } from 'Router/_Builder/_Bootstrap/DataAggregators/JS';
import { WsConfig } from 'Router/_Builder/_Bootstrap/DataAggregators/WsConfig';

const UNIX_TEST_MACHINE_URL = 'http://psdr-prognix31.corp.tensor.ru:30010/page/demo-card-font';
const PAGE_X_PACKAGE_URL = '/resources/SabyPageLayoutPackages/common/scripts.min.js';

describe('debug React on a test Unix machine', () => {
    const config = new Map<string, unknown>();
    const createTag = jest.fn();

    beforeEach(() => {
        config.clear();
        createTag.mockClear();

        jest.spyOn(AppEnv.location, 'href', 'get').mockReturnValue(UNIX_TEST_MACHINE_URL);
        jest.spyOn(AppEnv.location, 'pathname', 'get').mockReturnValue('/page/demo-card-font');
        jest.spyOn(AppEnv.cookie, 'get').mockReturnValue(null);
        jest.spyOn(AppEnv, 'setConfig').mockImplementation((key: string, value: unknown) => {
            config.set(key, value);
            return value;
        });
        jest.spyOn(AppEnv, 'getConfig').mockImplementation((key: string) => config.get(key));
        jest.spyOn(AppEnv, 'getStore').mockReturnValue({
            get: jest.fn().mockReturnValue(0),
            set: jest.fn().mockReturnValue(true),
        } as never);

        jest.spyOn(UIHead, 'createWsConfig').mockImplementation();
        jest.spyOn(AppHead, 'getInstance').mockReturnValue({
            createMergeTag: jest.fn(),
        } as unknown as AppHead);
        jest.spyOn(AppJSLinks, 'getInstance').mockReturnValue({
            createTag,
            getNewData: jest.fn().mockReturnValue([]),
        } as unknown as AppJSLinks);
        jest.spyOn(ModulesLoader, 'getModuleUrl').mockReturnValue(PAGE_X_PACKAGE_URL);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('loads the development React package', () => {
        const deps: ICollectedDeps = {
            js: ['React/react-superbundle.package'],
            css: {
                simpleCss: [],
                themedCss: [],
            },
            tmpl: [],
            wml: [],
            pagexPackages: true,
        };

        new WsConfig({} as never).execute(deps);
        new JS(false).execute(deps);

        expect(UIHead.createWsConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                isDebugReact: true,
            })
        );
        expect(createTag).toHaveBeenCalledWith(
            'script',
            expect.objectContaining({
                src: PAGE_X_PACKAGE_URL.replace('.min.js', '.js'),
            })
        );
    });
});
