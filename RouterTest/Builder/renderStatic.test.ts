import { logger } from 'Application/Env';
import * as Head from 'UI/Head';
import { renderStatic } from 'Router/Builder';
import { WsConfig } from 'Router/_Builder/_Bootstrap/DataAggregators/WsConfig';

describe('renderStatic', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation();
    });

    // TODO пока скипаю этот тест.
    // я не понимаю, как его написать так, чтобы он тестировал формирование статичной страницы,
    // но при этом чтобы этот тест не приходилось править при каждом изменении в формировании тела страницы.
    test.skip('renderStatelessStatic', () => {
        jest.spyOn(WsConfig.prototype, 'execute').mockImplementation();
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

    // тест для отладки при разработке
    // так удобнее, вместо того, чтобы пересобирать *.html.tmpl
    test.skip('renderEmptyDemoStatic', () => {
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
            buildEmptyDemo: true,
        });
        expect(html).toMatchSnapshot();
    });
});
