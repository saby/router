import { App } from 'Application/Env';
import * as AppEnv from 'Application/Env';
import WindowLocation from 'Router/_private/Router/WindowLocation';
import UrlRewriter from 'Router/_private/UrlRewriter';
import RouterUrl from 'Router/_private/Router/RouterUrl';

describe('Router/_private/RouterUrl', () => {
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

    describe('getServiceUrl', () => {
        let routerUrl: RouterUrl;

        let configState: Record<string, any>;

        beforeEach(() => {
            const _location = new WindowLocation('/path');
            _location.search = '?query=value';
            routerUrl = new RouterUrl(_location, UrlRewriter.getInstance());

            configState = App.getRequest().getConfig().getState();
        });

        afterEach(() => {
            App.getRequest().getConfig().setState(configState);
        });

        test('empty appRoot', () => {
            App.getRequest().getConfig().setState({ appRoot: undefined });
            expect(routerUrl.getServiceUrl('/page/main')).toBe('/page/main');
            expect(routerUrl.getServiceUrl('page/main')).toBe('page/main');
        });

        test('appRoot = "/"', () => {
            App.getRequest().getConfig().setState({ appRoot: '/' });
            expect(routerUrl.getServiceUrl('/page/main')).toBe('/page/main');
            expect(routerUrl.getServiceUrl('page/main')).toBe('page/main');
        });

        test('appRoot = "/service/"', () => {
            App.getRequest().getConfig().setState({ appRoot: '/service/' });
            expect(routerUrl.getServiceUrl('/page/main')).toBe('/service/page/main');
            expect(routerUrl.getServiceUrl('page/main')).toBe('/service/page/main');
        });

        test('appRoot = "/service/", url = "/service/page"', () => {
            App.getRequest().getConfig().setState({ appRoot: '/service/' });
            expect(routerUrl.getServiceUrl('/service/page/main')).toBe('/service/page/main');
            expect(routerUrl.getServiceUrl('service/page/main')).toBe('/service/page/main');
        });
    });
});

function addTests(service_name: string, appAlias?: string) {
    const appRoot = service_name ? `/${service_name}/` : '/';
    const serviceUrlPrefix = service_name ? `/${service_name}` : '';
    const appAliasUrlPrefix = appAlias ? `/${appAlias}` : '';

    const urlPrefix = serviceUrlPrefix + appAliasUrlPrefix;

    let routerUrl: RouterUrl;

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
        const _location = new WindowLocation(urlPrefix + '/path');
        _location.search = '?query=value';
        routerUrl = new RouterUrl(_location, UrlRewriter.getInstance());
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    test('getUrl', () => {
        expect(routerUrl.getUrl()).toBe(urlPrefix + '/path?query=value');
    });

    test('getStateUrl: _stateUrl вычислен в конструкторе RouterUrl', () => {
        // _stateUrl вычислен на основе результата результат вызова
        expect(routerUrl.getStateUrl()).toBe('/path?query=value');
    });

    test('getStateUrl: _stateUrl переназначен', () => {
        const newStateUrl = '/new/state/url';
        routerUrl.setStateUrl(newStateUrl);
        expect(routerUrl.getStateUrl()).toBe(newStateUrl);
    });

    test('getLogicUrl', () => {
        expect(routerUrl.getLogicUrl()).toBe('/path?query=value');
    });

    test('getRealUrl', () => {
        expect(routerUrl.getRealUrl()).toBe(urlPrefix + '/path?query=value');
        const customUrl = '/custom/url?with=query';
        expect(routerUrl.getRealUrl(customUrl)).toBe(urlPrefix + customUrl);
    });
}
