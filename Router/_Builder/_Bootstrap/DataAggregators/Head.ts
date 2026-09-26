import { Head as AppHead } from 'Application/Page';
import { ICollectedDeps } from 'UI/Deps';
import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { TagMarkup, fromJML } from 'UI/Base';

/**
 * Cтили для страницы. Лежат в <head>.
 * Пусть лучше страница потупит от запоздалых JS, чем будет дергаться от запоздалых CSS
 * @private
 */

export class Head implements IDataAggregatorModule {
    execute(deps: ICollectedDeps): Partial<IFullData> | null {
        const HeadAPI = AppHead.getInstance();
        void deps.links.forEach((link) => {
            HeadAPI.createTag('link', link);
        });

        // @ts-ignore
        const headApiData = HeadAPI.getNewData().map(fromJML);

        return {
            HeadAPIData: new TagMarkup(headApiData, {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}
