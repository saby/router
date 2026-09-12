import { logger } from 'Application/Env';
import { getAppNameByUrl } from 'Router/_private/MaskResolver';
import UrlRewriterTest from '../../UrlRewriter/UrlRewriterTest';

// переопределим router.js в тестах, т.к. он подтянется из корня, а там из Router-demo
UrlRewriterTest._createNewInstance({});

describe('Router/MaskResolver', () => {
    describe('#getAppNameByUrl', () => {
        it('returns index component name', () => {
            expect(getAppNameByUrl('/Website/Register')).toEqual('Website/Index');
        });

        it('ignores query params if they are separated by slash', () => {
            expect(getAppNameByUrl('/MainPage/?waittime=100')).toEqual('MainPage/Index');
        });

        it('ignores query params if they are NOT separated by slash', () => {
            expect(getAppNameByUrl('/ServerStatus?timeout=500')).toEqual('ServerStatus/Index');
        });

        it('ignores hash params if they are separated by slash', () => {
            expect(getAppNameByUrl('/MainPage/#waittime=100')).toEqual('MainPage/Index');
        });

        it('ignores hash params if they are NOT separated by slash', () => {
            expect(getAppNameByUrl('/MainPage#waittime=100')).toEqual('MainPage/Index');
        });

        it('allows one-part addresses', () => {
            expect(getAppNameByUrl('Booking')).toEqual('Booking/Index');
        });

        it('not throws exception and no decoding URI', () => {
            jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
            const wrongURI = '/Module/%E0%A4%A';
            expect(() => getAppNameByUrl(wrongURI)).not.toThrowError('URI malformed');
            expect(getAppNameByUrl(wrongURI)).toEqual('Module/Index');
        });
    });
});
