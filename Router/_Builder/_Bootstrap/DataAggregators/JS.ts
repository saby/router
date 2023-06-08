import {
    IDataAggregatorModule,
    ICollectedDeps,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks, IPageTagAttrs } from 'Application/Page';
import { cookie } from 'Env/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { LoadingStatus } from 'Router/_Builder/_Bootstrap/DataAggregators/LoadingStatus';
import { FILTER_BASE_DEPS } from './BaseScripts';

export class JS implements IDataAggregatorModule {
    execute(
        deps: ICollectedDeps,
        options?: IRenderOptions
    ): Partial<IFullData> | null {
        const API = AppJSLinks.getInstance();
        deps.js
            .filter((js) => {
                return !FILTER_BASE_DEPS.includes(js);
            })
            .map((js) => {
                return resolveLink(js);
            })
            .concat(
                deps.tmpl.map((rawLink) => {
                    return resolveLink(rawLink, 'tmpl');
                })
            )
            .concat(
                deps.wml.map((rawLink) => {
                    return resolveLink(rawLink, 'wml');
                })
            )
            .forEach((link, i) => {
                const attrs: IPageTagAttrs = {
                    type: 'text/javascript',
                    src: link,
                    defer: 'defer',
                    key: `scripts_${i}`,
                };

                // из пути типа resources/filename.min.js?x_module=12345678 получаем имя файла filename.min
                const name = link.split('/').pop().split('.js').shift();
                LoadingStatus.addLoadHandlers(attrs, name);

                API.createTag('script', attrs);
            });

        API.createTag(
            'script',
            { type: 'text/javascript' },
            `window['receivedStates']='${deps.rsSerialized}';`
        );

        return {
            JSLinksAPIData: new TagMarkup(API.getData().map(fromJML), {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}

function resolveLink(path: string, type: string = ''): string {
    return ModulesLoader.getModuleUrl(
        type ? `${type}!${path}` : path,
        cookie.get('s3debug')
    );
}
