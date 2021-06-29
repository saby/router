/// <amd-module name="Router/_Builder/_Bootstrap/DataAggregators/BaseScripts" />

import { IDataAggregatorModule, ICollectedDeps, IRenderOptions, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { getResourceUrl } from 'UICommon/Utils';
import { TagMarkup, fromJML } from 'UI/Base';

const BASE_DEPS_NAMESPACE: string = 'baseDeps';

export class BaseScripts implements IDataAggregatorModule {
    execute(deps: ICollectedDeps, options?: IRenderOptions): Partial<IFullData> | null {
        const  API = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);
        const scripts = {
            bundles: 'bundles',
            require: '/cdn/RequireJS/2.3.5-p5/require-min',
            contents: 'contents',
            router: 'router',
            config: 'RequireJsLoader/config'
        };
        let rawUrl: string;
        let src: string;

        for (const scriptsKey in scripts) {
            if (scripts.hasOwnProperty(scriptsKey)) {
                rawUrl = `${scripts[scriptsKey]}.js`;
                src = rawUrl.startsWith('/') ? rawUrl : getResourceUrl(cfg.resourceRoot + rawUrl);

                API.createTag('script', {
                    type: 'text/javascript',
                    key: scriptsKey,
                    src
                });
            }
        }

        return {
            JSLinksAPIBaseData: new TagMarkup(API.getData().map(fromJML), { getResourceUrl: false }).outerHTML
        };
    }
}
