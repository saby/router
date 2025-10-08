import * as AppEnv from 'Application/Env';
import MaskResolver from 'Router/_private/MaskResolver';
import RouterUrl from 'Router/_private/Router/RouterUrl';
import WindowLocation from 'Router/_private/Router/WindowLocation';
import UrlRewriterTest from '../../UrlRewriter/UrlRewriterTest';

// переопределим router.js в тестах, т.к. он подтянется из корня, а там из RouterDemo
UrlRewriterTest._createNewInstance({});

describe('Router/MaskResolver', () => {
    describe('appRoot = "/" и appAlias = undefined', () => {
        // тестируем когда на основном сервисе и без префикса брендированного приложения
        addTests('');
    });

    describe('appRoot = "/service_name/" и appAlias = undefined', () => {
        // тестируем когда на стороннем сервисе 'service_name' и без префикса брендированного приложения
        addTests('service_name');
    });

    describe('appRoot = "/" и appAlias = "alias"', () => {
        // тестируем когда на стороннем сервисе 'service_name' и без префикса брендированного приложения
        addTests('', 'alias');
    });

    describe('appRoot = "/service_name/" и appAlias = "alias"', () => {
        // тестируем когда на стороннем сервисе 'service_name' и без префикса брендированного приложения
        addTests('service_name', 'alias');
    });
});

function addTests(service_name: string, appAlias?: string) {
    const appRoot = service_name ? `/${service_name}/` : '/';
    const serviceUrlPrefix = service_name ? `/${service_name}` : '';
    const appAliasUrlPrefix = appAlias ? `/${appAlias}` : '';

    const urlPrefix = serviceUrlPrefix + appAliasUrlPrefix;

    let maskResolver: MaskResolver;

    beforeEach(() => {
        const getConfig = AppEnv.getConfig;
        jest.spyOn(AppEnv, 'getConfig').mockImplementation((key: string) => {
            if (key === 'appRoot') {
                return appRoot;
            }
            if (key === 'appAlias') {
                return appAlias;
            }
            return getConfig(key);
        });

        // исходный url = /path?query=value
        const _location = new WindowLocation(urlPrefix + '/path');
        _location.search = '?query=value';
        const routerUrl = new RouterUrl(_location, UrlRewriterTest.getInstance());
        maskResolver = new MaskResolver(UrlRewriterTest.getInstance(), routerUrl);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('#calculateQueryUrl', () => {
        it('add param', () => {
            const newUrl = maskResolver.calculateQueryUrl({ param: 'value' });
            expect(newUrl).toEqual(urlPrefix + '/path?query=value&param=value');
        });
        it('replace params', () => {
            const newUrl = maskResolver.calculateQueryUrl({ query: 'newvalue' });
            expect(newUrl).toEqual(urlPrefix + '/path?query=newvalue');
        });
        it('replace params, url has trailing slash', () => {
            // раньше была логика, что у url с расширением в конце (напр. .html) нельзя добавлять слеш в конце.
            // из-за неточной регулярки (типа /\.[^.]+$/) ситуация с url вида /site.ru/path/ обрабатывалась некорректно
            let newUrl = maskResolver.calculateQueryUrl(
                { param: 'newvalue' },
                '/site.ru/path/?param=value'
            );
            expect(newUrl).toEqual('/site.ru/path/?param=newvalue');

            newUrl = maskResolver.calculateQueryUrl(
                { param: 'newvalue' },
                'http://site.ru/?param=value'
            );
            expect(newUrl).toEqual('http://site.ru/?param=newvalue');
        });
        it('clear params', () => {
            let newUrl = maskResolver.calculateQueryUrl({ replace: true });
            expect(newUrl).toEqual(urlPrefix + '/path');

            newUrl = maskResolver.calculateQueryUrl(
                { replace: true },
                '/path?query=value&param=value1'
            );
            expect(newUrl).toEqual('/path');
        });
        it('clear and add params', () => {
            const newUrl = maskResolver.calculateQueryUrl({ param: 'newvalue', replace: true });
            expect(newUrl).toEqual(urlPrefix + '/path?param=newvalue');
        });
        it('clear fragment', () => {
            const newUrl = maskResolver.calculateQueryUrl(
                { clearFragment: true },
                '/path?query=value#fragment'
            );
            expect(newUrl).toEqual('/path?query=value');
        });
        it('url with protocol', () => {
            const newUrl = maskResolver.calculateQueryUrl({ param: 'value' }, 'http://site');
            expect(newUrl).toEqual('http://site?param=value');
        });
    });
}
