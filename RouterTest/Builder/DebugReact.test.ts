import * as AppEnv from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import * as UIHead from 'UI/Head';
import { HeadMainScripts } from 'Router/_Builder/_Bootstrap/DataAggregators/HeadMainScripts';

const TEST_MACHINE_DOMAIN = 'psdr-prognix31.corp.tensor.ru:30010';
const UNIX_TEST_MACHINE_URL = `http://${TEST_MACHINE_DOMAIN}/page/demo-card-font`;
const TEST_STAND_DOMAIN = 'test-online.saby.ru';
const TEST_URL = `http://${TEST_STAND_DOMAIN}/page/demo-card-font`;

describe('debug React on a test Unix machine', () => {
    beforeEach(() => {
        jest.spyOn(AppEnv.cookie, 'get').mockReturnValue(null);
        jest.spyOn(AppEnv, 'getStore').mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
            set: jest.fn(),
        } as never);

        jest.spyOn(UIHead, 'createWsConfig').mockImplementation();
        jest.spyOn(AppHead, 'getInstance').mockReturnValue({
            createMergeTag: jest.fn(),
        } as unknown as AppHead);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('включает debug-режим react на тестовом стенде', () => {
        jest.spyOn(AppEnv.location, 'href', 'get').mockReturnValue(TEST_URL);
        jest.spyOn(AppEnv.location, 'host', 'get').mockReturnValue(TEST_STAND_DOMAIN);

        new HeadMainScripts({} as never).execute();

        expect(UIHead.createWsConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                reactMode: 'debug',
            })
        );
    });
    test('включает debug-режим react на автотестовой тачке', () => {
        jest.spyOn(AppEnv.location, 'href', 'get').mockReturnValue(UNIX_TEST_MACHINE_URL);
        jest.spyOn(AppEnv.location, 'host', 'get').mockReturnValue(TEST_MACHINE_DOMAIN);

        new HeadMainScripts({} as never).execute();

        expect(UIHead.createWsConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                reactMode: 'default',
            })
        );
    });
});
