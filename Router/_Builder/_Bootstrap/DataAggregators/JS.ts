import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { query } from 'Application/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import { ICollectedDeps } from 'UI/Deps';
import { callStartScript } from './startScriptCaller';
import { createResourceBlockCallbackRegistrationCode } from 'RequireJsLoader/getResourcesList';

export class JS implements IDataAggregatorModule {
    constructor(private isEnd: boolean = true) {}

    execute(deps: ICollectedDeps): Partial<IFullData> | null {
        if (query.get.isCanceledRevive === 'noscripts') {
            return null;
        }

        if (this.isEnd && !(deps.requiredModules?.length ?? 0)) {
            // isEnd = true в двух случаях: при непотоковом построении или при потоковом построении при формировании последней порции html
            // если не оказалось списка модулей для require в стартовом скрипте (requiredModules), то просто не запускаем этот аггрегатор
            return null;
        }

        const API = AppJSLinks.getInstance();

        deps.scripts.forEach((script) => {
            if ('content' in script) {
                API.createTag('script', {}, script.content);
                return;
            }

            API.createTag('script', script);
        });

        if (this.isEnd) {
            const { content: startScriptCaller } =
                createResourceBlockCallbackRegistrationCode(callStartScript);
            API.createTag('script', {}, startScriptCaller);
        }

        if (typeof deps.rsSerialized === 'string') {
            API.createTag('script', {}, `window['receivedStates']='${deps.rsSerialized}';`);
        }

        // @ts-ignore
        const jsApiData = API.getNewData().map(fromJML);

        return {
            JSLinksAPIData: new TagMarkup(jsApiData, {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}
