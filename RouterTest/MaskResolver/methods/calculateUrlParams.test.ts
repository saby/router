/* stan-disable code-duplication -- это unit-тесты */
import { IoC } from 'Env/Env';
import MaskResolver from 'Router/_private/MaskResolver';
import RouterUrl from 'Router/_private/Router/RouterUrl';
import WindowLocation from 'Router/_private/Router/WindowLocation';
import UrlRewriterTest from '../../UrlRewriter/UrlRewriterTest';

// переопределим router.js в тестах, т.к. он подтянется из корня, а там из Router-demo
UrlRewriterTest._createNewInstance({});

describe('Router/MaskResolver', () => {
    const _location = new WindowLocation('/path');
    _location.search = '?query=value';
    const routerUrl = new RouterUrl(_location, UrlRewriterTest.getInstance());
    const maskResolver = new MaskResolver(UrlRewriterTest.getInstance(), routerUrl);

    describe('#calculateUrlParams', () => {
        it('decodes uri components', () => {
            const mask = 'fullname/:name';
            const url = '/fullname/John%20Doe';
            const calculated = maskResolver.calculateUrlParams(mask, url);

            expect(calculated.name).toEqual('John Doe');
        });

        it('decodes encoded forward slash', () => {
            const mask = 'order/:products';
            const url = '/restaurant/order/bacon%2Flettuce%2Ftomato/time/now';
            const calculated = maskResolver.calculateUrlParams(mask, url);

            expect(calculated.products).toEqual('bacon/lettuce/tomato');
        });

        describe('one parameter with slash', () => {
            it('interprets end of url as separator', () => {
                const mask = 'tab/:tabName';
                const url = '/order/tab/taxi';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.tabName).toEqual('taxi');
            });

            it('interprets start of query as separator', () => {
                const mask = 'tab/:tabName';
                const url = '/order/tab/yacht?price=expensive';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.tabName).toEqual('yacht');
            });

            it('interprets start of hash as separator', () => {
                const mask = 'tab/:tabName';
                const url = '/order/tab/plane#time_spent=10h';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.tabName).toEqual('plane');
            });

            it('interprets slash as separator', () => {
                const mask = 'tab/:tabName';
                const url = '/order/tab/train/personal';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.tabName).toEqual('train');
            });

            // TODO Add root masks to docs
            it('recognizes root mask', () => {
                const mask = '/tab/:tabName';
                const url = '/tab/main/subtab/tab/signup';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.tabName).toEqual('main');
            });

            describe('некорректная маска', () => {
                const originalLogger = IoC.resolve('ILogger');
                beforeEach(() => {
                    // переопределяем логгер, чтобы при ошибке некорректной маски не упали тесты из-за сообщений логгера
                    IoC.bind('ILogger', {
                        warn: originalLogger.warn,
                        error: () => {
                            /* */
                        },
                        log: originalLogger.log,
                        info: originalLogger.info,
                    });
                });
                afterEach(() => {
                    IoC.bind('ILogger', originalLogger);
                });
                // TODO Add presence masks to docs?
                it('works with presence masks', () => {
                    const mask = 'word';
                    const url = '/tab/main/order/word/2003';

                    expect(
                        maskResolver.calculateUrlParams.bind(maskResolver, mask, url)
                    ).not.toThrow();
                });
            });

            it('few parameters in mask', () => {
                const mask = 'tab/:tabName/subtab/:subName';
                const url = '/order/tab/taxi/subtab/cars';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.tabName).toEqual('taxi');
                expect(calculated.subName).toEqual('cars');
            });

            it('few parameters in mask not in url', () => {
                let mask = 'tab/:tabName/subtab/:subName';
                let url = '/order/tab/taxi';
                let calculated = maskResolver.calculateUrlParams(mask, url);
                expect(calculated.tabName).toEqual('taxi');
                expect(calculated.subName).toBeUndefined();

                mask = '/group/:groupId/page/:pageId';
                url = '/group/page/group-page-1';
                calculated = maskResolver.calculateUrlParams(mask, url);
                expect(calculated.groupId).toEqual('page');
                expect(calculated.pageId).toBeUndefined();
            });
        });

        describe('one parameter with query', () => {
            it('interprets end of url as separator', () => {
                const mask = 'param=:pvalue';
                const url = '/path?param=value';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.pvalue).toEqual('value');
            });

            it('interprets ampersand as separator', () => {
                const mask = 'param=:pvalue';
                const url = '/path?param=value&otherparam=othervalue';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.pvalue).toEqual('value');
            });

            it('interprets ampersand as separator 2', () => {
                const mask = 'param=:pvalue';
                const url = '/path?firstparam=firstvalue&param=value&otherparam=othervalue';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.pvalue).toEqual('value');
            });

            it('interprets start of hash as separator', () => {
                const mask = 'param=:pvalue';
                const url = '/path?param=value#hash=true';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.pvalue).toEqual('value');
            });

            it('few parameters in mask', () => {
                const mask = 'param=:pvalue&query=:qvalue';
                const url = '/path?param=value&query=different';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.pvalue).toEqual('value');
                expect(calculated.qvalue).toEqual('different');
            });

            it('few parameters in mask not in url', () => {
                const mask = 'param=:pvalue&query=:qvalue';
                const url = '/path?param=value';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.pvalue).toEqual('value');
                expect(calculated.qvalue).toBeUndefined();
            });
        });

        describe('multiparameter mask', () => {
            it('reads the parameters in the correct order', () => {
                const mask = 'page/:first/:second/:third';
                const url = '/mysite/page/the/main/menu/notthis';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.first).toEqual('the');
                expect(calculated.second).toEqual('main');
                expect(calculated.third).toEqual('menu');
            });

            it('fills in the missing parameters as undefined', () => {
                const mask = 'tab/:first/:second/:third';
                const url = '/order/tab/train';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.first).toEqual('train');
                expect(calculated.second).toBeUndefined();
                expect(calculated.third).toBeUndefined();
            });

            it('recognizes root mask', () => {
                const mask = '/page/:name/:tab';
                const url = '/page/main/order/page/275';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.name).toEqual('main');
                expect(calculated.tab).toEqual('order');
            });

            it('recognizes root mask and fills in the missing parameters as undefined', () => {
                const mask = '/page/:name/:tab';
                const url = '/page/main';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.name).toEqual('main');
                expect(calculated.tab).toBeUndefined();
            });

            it('mask with slash at the end', () => {
                const mask = 'tab/:page/:key/';
                const url = '/path/tab/complect/20384325';
                const calculated = maskResolver.calculateUrlParams(mask, url);

                expect(calculated.page).toEqual('complect');
                expect(calculated.key).toEqual('20384325');
            });
        });
    });
});
