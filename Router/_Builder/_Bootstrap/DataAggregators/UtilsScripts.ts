import {
    IDataAggregatorModule,
    ICollectedDeps,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { TagMarkup, fromJML } from 'UI/Base';

export const TIMETESTER_SCRIPTS_NAMESPACE: string = 'timeTesterScripts';

export class UtilsScripts implements IDataAggregatorModule {
    execute(
        deps: ICollectedDeps,
        options?: IRenderOptions
    ): Partial<IFullData> | null {
        const API = AppJSLinks.getInstance(TIMETESTER_SCRIPTS_NAMESPACE);

        return {
            JSLinksAPITimeTesterData: new TagMarkup(
                API.getData().map(fromJML),
                { getResourceUrl: false }
            ).outerHTML,
        };
    }
}
