import { UrlParts } from 'Router/_private/MaskResolver/UrlParts';
import {
    UrlParamsGetter,
    PathParams,
    QueryParams,
} from 'Router/_private/MaskResolver/UrlParamsGetter';

describe('Router/_private/MaskResolver/UrlParamsGetter', () => {
    describe('UrlParamsGetter', () => {
        it('simple url', () => {
            const params = new UrlParamsGetter(
                'param/:valueId',
                '/path/param/value'
            ).get();
            expect(params.valueId).toEqual('value');
        });
        it('query url', () => {
            const params = new UrlParamsGetter(
                'param=:valueId',
                '/path/?param=value'
            ).get();
            expect(params.valueId).toEqual('value');
        });
        it('path fragment url', () => {
            const params = new UrlParamsGetter(
                'param/:valueId',
                '/path/#param/value'
            ).get();
            expect(params.valueId).toEqual('value');
        });
        it('query fragment url', () => {
            const params = new UrlParamsGetter(
                '#param=:valueId',
                '/path/#param=value'
            ).get();
            expect(params.valueId).toEqual('value');
        });
    });
    describe('PathParams', () => {
        it('simple url', () => {
            const urlParts = new UrlParts('/path/param/value');
            const params = PathParams.calculateParams(
                'param/:valueId',
                urlParts.getPath()
            );
            expect(params[0].maskId).toEqual('valueId');
            expect(params[0].urlValue).toEqual('value');
            expect(params[0].urlId).toEqual('param');
        });
        it('complicated mask', () => {
            const params = PathParams.calculateParams(
                'path/:pathId/param/:valueId',
                '/path/param/value'
            );
            const expected = [
                { maskId: 'pathId', urlValue: 'param', urlId: 'path' },
                { maskId: 'valueId', urlValue: undefined, urlId: 'param' },
            ];
            expect(params).toEqual(expected);
        });
        it('fragment url', () => {
            const urlParts = new UrlParts('/path/#param/value');
            const params = PathParams.calculateParams(
                'param/:valueId',
                urlParts.getFragment()
            );
            expect(params[0].maskId).toEqual('valueId');
            expect(params[0].urlValue).toEqual('value');
            expect(params[0].urlId).toEqual('param');
        });
    });
    describe('QueryParams', () => {
        it('simple url', () => {
            const urlParts = new UrlParts('/path/?param=value');
            const params = QueryParams.createQueryObject().calculateParams(
                'param=:valueId',
                urlParts.getQuery()
            );
            expect(params[0].maskId).toEqual('valueId');
            expect(params[0].urlValue).toEqual('value');
            expect(params[0].urlId).toEqual('param');
        });
        it('fragment url', () => {
            const urlParts = new UrlParts('/path/#param=value');
            const params = QueryParams.createFragmentObject().calculateParams(
                'param=:valueId',
                urlParts.getFragment()
            );
            expect(params[0].maskId).toEqual('valueId');
            expect(params[0].urlValue).toEqual('value');
            expect(params[0].urlId).toEqual('param');
        });
    });
});
