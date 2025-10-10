import { logger } from 'Application/Env';
import * as Head from 'UI/Head';
import { renderStatic } from 'Router/Builder';

describe('renderStatelessStatic', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation();
    });

    test('main', () => {
        jest.spyOn(Head, 'createWsConfig').mockImplementation();
        jest.spyOn(Head, 'createDefaultTags').mockImplementation();

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
        expect(html).toMatchSnapshot();
    });
});
