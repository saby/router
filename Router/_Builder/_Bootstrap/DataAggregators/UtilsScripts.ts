/// <amd-module name="Router/_Builder/_Bootstrap/DataAggregators/UtilsScripts" />

import { IDataAggregatorModule, ICollectedDeps, IRenderOptions, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { JSLinks as AppJSLinks } from 'Application/Page';
import { getResourceUrl } from 'UICommon/Utils';
import { TagMarkup, fromJML } from 'UI/Base';

const TIMETESTER_SCRIPTS_NAMESPACE: string = 'timeTesterScripts';

export class UtilsScripts implements IDataAggregatorModule {
    execute(deps: ICollectedDeps, options?: IRenderOptions): Partial<IFullData> | null {
        const  API = AppJSLinks.getInstance(TIMETESTER_SCRIPTS_NAMESPACE);
        [{
            type: 'text/javascript',
            key: 'boomerang',
            src: getResourceUrl('/cdn/Boomerang/v.0.0.2.js')
        }, {
            type: 'text/javascript',
            key: 'timetester',
            src: getResourceUrl(`${options.resourceRoot}SbisEnvUI/callTimeTesterMinified.js`)
        }].forEach((params) => API.createTag('script', params));

        return {
            JSLinksAPITimeTesterData: new TagMarkup(API.getData().map(fromJML), { getResourceUrl: false }).outerHTML
        };
    }
}
