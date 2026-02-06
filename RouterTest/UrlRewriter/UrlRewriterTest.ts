import { getStore } from 'Application/Env';
import UrlRewriterAPI, { _prepareRoutes } from 'Router/_private/UrlRewriter';
import { UrlRewriterClass } from 'Router/_private/UrlRewriter/UrlRewriterClass';

/**
 * Класс, необходимый для unit тестов для переопределения router.json с которым работает его родитель UrlRewriter
 * @private
 */
export default class UrlRewriterTest extends UrlRewriterAPI {
    static _createNewInstance(json: {}, altJson?: {}): UrlRewriterAPI {
        const rewriters: UrlRewriterClass[] = [];

        rewriters.push(new UrlRewriterClass(_prepareRoutes(json)));

        if (altJson) {
            rewriters.push(new UrlRewriterClass(_prepareRoutes(altJson)));
        }

        const instance = new UrlRewriterAPI(rewriters);
        const store = getStore<Record<string, UrlRewriterAPI>>('UrlRewriterAPI');
        store.set('instance', instance);
        return instance;
    }
}
