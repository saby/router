import UrlRewriter, { _prepareRoutes } from 'Router/_private/UrlRewriter';
import UrlRewriterTest from './UrlRewriterTest';
// @ts-ignore
import * as routerJson from 'RouterTest/resources/router';
// @ts-ignore
import * as customRouterJson from 'RouterTest/resources/routerCustom';

describe('Router/UrlRewriter', () => {
    const urlRewriter: UrlRewriter = UrlRewriterTest._createNewInstance(
        routerJson,
        customRouterJson
    );

    describe('UrlRewriter.get', () => {
        test('найдется из базового router.json', () => {
            // router.js - '/': 'OnlineSbisRu'
            expect(urlRewriter.get('/')).toBe('/OnlineSbisRu');
        });

        test('найдется из базового router.json, даже если есть такой в кастомном', () => {
            // router.js = '/regex:^([0-9]{5})$': 'OnlineSbisRu/$1'
            expect(urlRewriter.get('/12345')).toBe('/OnlineSbisRu/12345');
        });

        test('найдется из кастомного router.json, т.к. есть только там', () => {
            // routerCustom.js = '/my-page': 'MyModule/my-page'
            expect(urlRewriter.get('/my-page')).toBe('/MyModule/my-page');
        });
    });

    describe('UrlRewriter.getReverse', () => {
        test('найдется из базового router.json', () => {
            // router.js - '/': 'OnlineSbisRu'
            expect(urlRewriter.getReverse('/OnlineSbisRu')).toBe('/');
        });

        test('найдется из кастомного router.json, даже если есть такой в базовом', () => {
            // router.js = '/a/b': 'ab'
            expect(urlRewriter.getReverse('ab')).toBe('/a/b');
        });

        test('найдется из кастомного router.json, т.к. есть только там', () => {
            // routerCustom.js = '/my-page': 'MyModule/my-page'
            expect(urlRewriter.getReverse('/MyModule/my-page')).toBe('/my-page');
        });
    });
});
