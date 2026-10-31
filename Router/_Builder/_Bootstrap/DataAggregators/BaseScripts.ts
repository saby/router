import { getScripts } from 'RequireJsLoader/bootstrap';
import { query } from 'Application/Env';
import { IDataAggregatorModule, IFullData } from '../Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { TagMarkup, fromJML } from 'UI/Base';

const BASE_DEPS_NAMESPACE: string = 'baseDeps';

export const REQUIRE_PATH = 'RequireJsLoader/third-party/WebRequire';

export class BaseScripts implements IDataAggregatorModule {
    readonly addsScripts: boolean = true;

    execute(): Partial<IFullData> | null {
        if (query.get.isCanceledRevive === 'noscripts') {
            return null;
        }

        const API = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);

        for (const script of getScripts()) {
            API.createTag('script', script);
        }

        return {
            // @ts-ignore
            JSLinksAPIBaseData: new TagMarkup(API.getData().map(fromJML), {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}

/**
 * Базовые скрипты для демки require
 */
export class EmptyDemoBaseScripts implements IDataAggregatorModule {
    execute(): Partial<IFullData> | null {
        const API = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);

        const baseScripts: { src: string; onload?: string }[] = getScripts();

        for (const script of baseScripts) {
            API.createTag('script', {
                ...script,
                fetchpriority: 'high',
            });
        }

        return {
            // @ts-ignore
            JSLinksAPIBaseData: new TagMarkup(API.getData().map(fromJML), {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}
