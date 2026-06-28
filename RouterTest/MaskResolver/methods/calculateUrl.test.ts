import * as AppEnv from 'Application/Env';
import MaskResolver from 'Router/_private/MaskResolver';
import RouterUrl from 'Router/_private/Router/RouterUrl';
import WindowLocation from 'Router/_private/Router/WindowLocation';
import UrlRewriterTest from '../../UrlRewriter/UrlRewriterTest';

// переопределим router.js в тестах, т.к. он подтянется из корня, а там из Router-demo
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

    let routerUrl: RouterUrl;
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

        const _location = new WindowLocation(urlPrefix + '/path');
        _location.search = '?query=value';
        routerUrl = new RouterUrl(_location, UrlRewriterTest.getInstance());
        maskResolver = new MaskResolver(UrlRewriterTest.getInstance(), routerUrl);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('#calculateUrl', () => {
        describe('simple masks', () => {
            describe('starting at root url', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/');
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:value', {
                        value: 'fvalue',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/first/fvalue');
                });
            });
            describe('starting with simple params', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/first/fvalue/second/svalue/');
                });
                it('can change an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('second/:value', {
                        value: 'abc',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/first/fvalue/second/abc/');
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newval/:value', {
                        value: 'supernew',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix + '/first/fvalue/second/svalue/newval/supernew/'
                    );
                });
                it('can add a new value and change an existing value', () => {
                    let newUrl = maskResolver.calculateUrl('first/:fvalue/newval/:value', {
                        fvalue: 'fnew',
                        value: 'supernew',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix + '/first/fnew/second/svalue/newval/supernew/'
                    );
                    // то же самое, но в маске порядок полей не как в url
                    newUrl = maskResolver.calculateUrl('newval/:value/second/:svalue', {
                        value: 'supernew',
                        svalue: 'snew',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix + '/first/fvalue/second/snew/newval/supernew/'
                    );
                });
                it('can remove an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:value', { clear: true });
                    expect(newUrl).toEqual(urlPrefix + '/second/svalue/');
                });
            });
            describe('starting with query', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/?qfrst=fvalue&qscnd=svalue');
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newval/:value', {
                        value: 'supernew',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix + '/newval/supernew?qfrst=fvalue&qscnd=svalue'
                    );
                });
            });
            describe('starting with simple params and query', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue');
                });
                it('can change an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('second/:value', {
                        value: 'abc',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix + '/first/fvalue/second/abc/?qfrst=fvalue&qscnd=svalue'
                    );
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newval/:value', {
                        value: 'supernew',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix +
                            '/first/fvalue/second/svalue/newval/supernew/?qfrst=fvalue&qscnd=svalue'
                    );
                });
                it('can remove an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:value', { clear: true });
                    expect(newUrl).toEqual(urlPrefix + '/second/svalue/?qfrst=fvalue&qscnd=svalue');
                });
                it('can replace value', () => {
                    const newUrl = maskResolver.calculateUrl('/test/:value', {
                        value: 'abc',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/test/abc/');
                });
            });
        });

        describe('multiparam masks', () => {
            describe('starting at root url', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/');
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newname/:first/:second', {
                        first: 'a',
                        second: 'b',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/newname/a/b');
                });
            });
            describe('starting with simple params', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/first/fvalue/second/svalue/');
                });
                it('can change an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:a/:b/:c', {
                        a: 'ast',
                        b: 'bst',
                        c: 'cst',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/first/ast/bst/cst/');
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newname/:first/:second', {
                        first: 'a',
                        second: 'b',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/first/fvalue/second/svalue/newname/a/b/');
                });
                it('can remove an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:a/:b', { clear: true });
                    expect(newUrl).toEqual(urlPrefix + '/svalue/');
                });
            });
            describe('starting with query', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/?qfrst=fvalue&qscnd=svalue');
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newname/:first/:second', {
                        first: 'a',
                        second: 'b',
                    });
                    expect(newUrl).toEqual(urlPrefix + '/newname/a/b?qfrst=fvalue&qscnd=svalue');
                });
            });
            describe('starting with simple params and query', () => {
                beforeEach(() => {
                    routerUrl.setStateUrl('/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue');
                });
                it('can change an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:a/:b/:c', {
                        a: 'ast',
                        b: 'bst',
                        c: 'cst',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix + '/first/ast/bst/cst/?qfrst=fvalue&qscnd=svalue'
                    );
                });
                it('can add a new value', () => {
                    const newUrl = maskResolver.calculateUrl('newname/:first/:second', {
                        first: 'a',
                        second: 'b',
                    });
                    expect(newUrl).toEqual(
                        urlPrefix +
                            '/first/fvalue/second/svalue/newname/a/b/?qfrst=fvalue&qscnd=svalue'
                    );
                });
                it('can remove an existing value', () => {
                    const newUrl = maskResolver.calculateUrl('first/:a/:b', { clear: true });
                    expect(newUrl).toEqual(urlPrefix + '/svalue/?qfrst=fvalue&qscnd=svalue');
                });
                it('can replace value', () => {
                    const newUrl = maskResolver.calculateUrl('/newpath/:bv/:cv', {
                        bv: 'b',
                        cv: 35,
                    });
                    expect(newUrl).toEqual(urlPrefix + '/newpath/b/35/');
                });
            });

            describe('query masks', () => {
                describe('starting at root url', () => {
                    beforeEach(() => {
                        routerUrl.setStateUrl('/');
                    });
                    it('can add a new value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qfrst=abc');
                    });
                });
                describe('starting with simple params', () => {
                    it('can add a new value', () => {
                        routerUrl.setStateUrl('/first/fvalue/second/svalue/');
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/first/fvalue/second/svalue/?qfrst=abc'
                        );
                    });
                    it('can add a new value with forward slash', () => {
                        routerUrl.setStateUrl('/first/fvalue/second/svalue');
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/first/fvalue/second/svalue?qfrst=abc');
                    });
                });
                describe('starting with query', () => {
                    beforeEach(() => {
                        routerUrl.setStateUrl('/?qfrst=fvalue&qscnd=svalue');
                    });
                    it('can change an existing value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qfrst=abc&qscnd=svalue');
                    });

                    it('can change an existing value and add new param', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:vfrst&qthrd=:vthrd', {
                            vfrst: '',
                            vthrd: 'three',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qfrst=&qscnd=svalue&qthrd=three');
                    });

                    it('can add a new value', () => {
                        const newUrl = maskResolver.calculateUrl('qthrd=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qfrst=fvalue&qscnd=svalue&qthrd=abc');
                    });
                    it('can remove an existing value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            clear: true,
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qscnd=svalue');
                    });
                    it('can remove the only value', () => {
                        routerUrl.setStateUrl('/?qfrst=fvalue');
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            clear: true,
                        });
                        expect(newUrl).toEqual(urlPrefix + '/');
                    });
                });
                describe('starting with simple params and query', () => {
                    beforeEach(() => {
                        routerUrl.setStateUrl(
                            '/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue'
                        );
                    });
                    it('can change an existing value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/first/fvalue/second/svalue/?qfrst=abc&qscnd=svalue'
                        );
                    });
                    it('can add a new value', () => {
                        const newUrl = maskResolver.calculateUrl('qthrd=:value', {
                            value: 'abc',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix +
                                '/first/fvalue/second/svalue/?qfrst=fvalue&qscnd=svalue&qthrd=abc'
                        );
                    });
                    it('can remove an existing value', () => {
                        const newUrl = maskResolver.calculateUrl('qscnd=:value', {
                            clear: true,
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/first/fvalue/second/svalue/?qfrst=fvalue'
                        );
                    });
                });
            });

            describe('shared cases', () => {
                describe('simple param', () => {
                    beforeEach(() => {
                        routerUrl.setStateUrl('/first/special%20param/second/svalue');
                    });

                    it('can add encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('test/:value', {
                            value: 'has spaces',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/first/special%20param/second/svalue/test/has%20spaces'
                        );
                    });
                    it('can change encoded value to encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('first/:value', {
                            value: 'has spaces',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/first/has%20spaces/second/svalue');
                    });
                    it('can change encoded value to unencoded value', () => {
                        const newUrl = maskResolver.calculateUrl('first/:value', {
                            value: 'simple',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/first/simple/second/svalue');
                    });
                    it('can change unencoded value to encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('second/:value', {
                            value: 'with/slash',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/first/special%20param/second/with%2Fslash'
                        );
                    });
                    it('can remove encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('first/:value', {
                            clear: true,
                        });
                        expect(newUrl).toEqual(urlPrefix + '/second/svalue');
                    });
                });

                describe('query param', () => {
                    beforeEach(() => {
                        routerUrl.setStateUrl('/?qfrst=special%20value&qscnd=svalue');
                    });

                    it('can add encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('qthrd=:value', {
                            value: 'mail@me',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/?qfrst=special%20value&qscnd=svalue&qthrd=mail%40me'
                        );
                    });
                    it('can change encoded value to encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'with spaces',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qfrst=with%20spaces&qscnd=svalue');
                    });
                    it('can change encoded value to unencoded value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            value: 'simple',
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qfrst=simple&qscnd=svalue');
                    });
                    it('can change unencoded value to encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('qscnd=:value', {
                            value: 'my$money',
                        });
                        expect(newUrl).toEqual(
                            urlPrefix + '/?qfrst=special%20value&qscnd=my%24money'
                        );
                    });
                    it('can remove encoded value', () => {
                        const newUrl = maskResolver.calculateUrl('qfrst=:value', {
                            clear: true,
                        });
                        expect(newUrl).toEqual(urlPrefix + '/?qscnd=svalue');
                    });
                });
            });

            // по ошибке символ ":" не допускался к использованию в url
            it('случай, когда в url есть символ :', () => {
                routerUrl.setStateUrl(
                    '/page/task-card/5%7C2503339320%7C2026-03-05T11:37:05.129295+03'
                );
                const newUrl = maskResolver.calculateUrl('/page/:pageId/:cardId', {
                    pageId: 'setting-card',
                    cardId: '5|423434345435',
                });
                expect(newUrl).toEqual(urlPrefix + '/page/setting-card/5%7C423434345435');
            });
        });

        describe('appends to the end of url if mask has more parameters than url', () => {
            it('can append to end of url', () => {
                routerUrl.setStateUrl('/root/page/signup');
                const newUrl = maskResolver.calculateUrl('page/:pageName/:pageParam', {
                    pageName: 'login',
                    pageParam: 'now',
                });
                expect(newUrl).toEqual(urlPrefix + '/root/page/login/now');
            });
            it('can append to end of main part of url if it has query params', () => {
                routerUrl.setStateUrl('/root/page/signup?query=true');
                const newUrl = maskResolver.calculateUrl('page/:pageName/:pageParam', {
                    pageName: 'login',
                    pageParam: 'now',
                });
                expect(newUrl).toEqual(urlPrefix + '/root/page/login/now?query=true');
            });
            it('can append to end of main part of url if it has query params after slash', () => {
                routerUrl.setStateUrl('/root/page/signup/?query=true');
                const newUrl = maskResolver.calculateUrl('page/:pageName/:pageParam', {
                    pageName: 'login',
                    pageParam: 'now',
                });
                // trailing slash doesn't matter for routing
                expect(newUrl).toEqual(urlPrefix + '/root/page/login/now/?query=true');
            });
            it('can append to end of main part of url if it has hash', () => {
                routerUrl.setStateUrl('/root/page/signup#hashparam');
                const newUrl = maskResolver.calculateUrl('page/:pageName/:pageParam', {
                    pageName: 'login',
                    pageParam: 'now',
                });
                expect(newUrl).toEqual(urlPrefix + '/root/page/login/now#hashparam');
            });
            it('can append to end of main part of url if it has hash after slash', () => {
                routerUrl.setStateUrl('/root/page/signup/#hashparam');
                const newUrl = maskResolver.calculateUrl('page/:pageName/:pageParam', {
                    pageName: 'login',
                    pageParam: 'now',
                });
                expect(newUrl).toEqual(urlPrefix + '/root/page/login/now/#hashparam');
            });
        });

        describe('fragments with slash', () => {
            beforeEach(() => {
                routerUrl.setStateUrl('/path/#first/fvalue/second/svalue');
            });
            it('can change an existing value', () => {
                let newUrl = maskResolver.calculateUrl('first/:value', {
                    value: 'abc',
                });
                expect(newUrl).toEqual(urlPrefix + '/path/#first/abc/second/svalue');
                newUrl = maskResolver.calculateUrl('second/:value', {
                    value: 'abc',
                });
                expect(newUrl).toEqual(urlPrefix + '/path/#first/fvalue/second/abc');
            });
            it('can add a new value', () => {
                const newUrl = maskResolver.calculateUrl('#newval/:value', {
                    value: 'supernew',
                });
                expect(newUrl).toEqual(
                    urlPrefix + '/path/#first/fvalue/second/svalue/newval/supernew'
                );
            });
        });

        describe('fragments with queries', () => {
            beforeEach(() => {
                routerUrl.setStateUrl('/path/#first=fvalue&second=svalue');
            });
            it('can change an existing value', () => {
                const newUrl = maskResolver.calculateUrl('#second=:value', { value: 'abc' });
                expect(newUrl).toEqual(urlPrefix + '/path/#first=fvalue&second=abc');
            });
        });

        /** Проверка вычисления url-адреса, когда используется корневая маска (с "/" вначале).
         * с опцией keepQuery query-часть url-адреса не должна очищаться
         */
        describe('keepQuery', () => {
            it('root url', () => {
                routerUrl.setStateUrl('/?query=value');
                const newUrl = maskResolver.calculateUrl('/page/:pageId', {
                    pageId: 'NewName',
                    keepQuery: true,
                });
                expect(newUrl).toEqual(urlPrefix + '/page/NewName?query=value');
            });
            it('simple url', () => {
                routerUrl.setStateUrl('/page/Name?query=value');
                const newUrl = maskResolver.calculateUrl('/page/:pageId', {
                    pageId: 'NewName',
                    keepQuery: true,
                });
                expect(newUrl).toEqual(urlPrefix + '/page/NewName?query=value');
            });
        });

        it('url with protocol', () => {
            const newUrl = maskResolver.calculateUrl(
                '?param=:param',
                { param: 'value' },
                'http://site'
            );
            expect(newUrl).toEqual('http://site?param=value');
        });
    });
}
