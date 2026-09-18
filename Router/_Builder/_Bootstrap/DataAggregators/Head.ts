import { Head as AppHead } from 'Application/Page';
import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IFullData,
    IRenderOptions,
} from 'Router/_Builder/_Bootstrap/Interface';
import { EMPTY_THEME, getThemeController, THEME_TYPE } from 'UI/theme/controller';
import { TagMarkup, fromJML } from 'UI/Base';

/**
 * Cтили для страницы. Лежат в <head>.
 * Пусть лучше страница потупит от запоздалых JS, чем будет дергаться от запоздалых CSS
 * @private
 */

export class Head implements IDataAggregatorModule {
    constructor(private theme?: IRenderOptions['theme']) {}

    execute(deps: ICollectedDeps): Partial<IFullData> | null {
        const HeadAPI = AppHead.getInstance();
        const tc = getThemeController();
        void deps.css.simpleCss
            .filter((name) => {
                return !!name;
            })
            .map((name) => {
                return tc.get(name, EMPTY_THEME);
            });
        void deps.css.themedCss
            .filter((name) => {
                return !!name;
            })
            .map((name) => {
                return tc.get(name, this.theme, THEME_TYPE.SINGLE);
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
