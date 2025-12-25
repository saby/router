import { logger } from 'Application/Env';
import { JSLinks } from 'Application/Page';
import * as Head from 'UI/Head';
import { renderStatic } from 'Router/Builder';
import { REQUIRE_PATH } from 'Router/_Builder/_Bootstrap/DataAggregators/BaseScripts';

describe('renderStatelessStatic', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation();
    });

    test('main', () => {
        jest.spyOn(Head, 'createWsConfig').mockImplementation();
        jest.spyOn(Head, 'createDefaultTags').mockImplementation();
        const createTagSpy = jest.spyOn(JSLinks.prototype, 'createTag').mockImplementation();

        const html = renderStatic({
            wsRoot: '%{WI.SBIS_ROOT}',
            resourceRoot: '%{RESOURCE_ROOT}',
            metaRoot: '%{META_ROOT}',
            defaultServiceUrl: '%{SERVICES_PATH}',
            appRoot: '%{APPLICATION_ROOT}',
            // @ts-ignore
            RUMEnabled: '%{RUM_ENABLED}',
            pageName: '%{PAGE_NAME}',
            builder: 'function anonymous() {return"";}',
            buildStateless: { lang: 'ru' },
            dependencies: ['Module/Index'],
        });
        expect(createTagSpy).toHaveBeenCalledTimes(1);
        expect(createTagSpy).toHaveBeenCalledWith(
            'script',
            expect.objectContaining({
                onerror: "onErrorHandler('require')",
                src: expect.stringContaining(REQUIRE_PATH),
            })
        );
        expect(html).toMatchSnapshot();
    });
});
