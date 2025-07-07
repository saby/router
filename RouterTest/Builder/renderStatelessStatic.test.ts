import * as Head from 'UI/Head';
import { renderStatic } from 'Router/Builder';

describe('renderStatelessStatic', () => {
    test('main', () => {
        jest.spyOn(Head, 'createWsConfig').mockImplementation();

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
