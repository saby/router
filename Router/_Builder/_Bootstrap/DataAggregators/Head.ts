import { Head as AppHead } from 'Application/Page';
import {
    IDataAggregatorModule,
    ICollectedDeps,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';
import {
    EMPTY_THEME,
    getThemeController,
    THEME_TYPE,
} from 'UICommon/theme/controller';
import { TagMarkup, fromJML } from 'UI/Base';

/**
 * Cтили для страницы. Лежат в <head>.
 * Пусть лучше страница потупит от запоздалых JS, чем будет дергаться от запоздалых CSS
 * @private
 */

export class Head implements IDataAggregatorModule {
    execute(
        deps: ICollectedDeps,
        options?: IRenderOptions
    ): Partial<IFullData> | null {
        const HeadAPI = AppHead.getInstance();
        const tc = getThemeController();
        deps.css.simpleCss
            .filter((name) => {
                return !!name;
            })
            .map((name) => {
                return tc.get(name, EMPTY_THEME);
            });
        deps.css.themedCss
            .filter((name) => {
                return !!name;
            })
            .map((name) => {
                return tc.get(name, options.theme, THEME_TYPE.SINGLE);
            });

        return {
            HeadAPIData: new TagMarkup(HeadAPI.getData().map(fromJML), {
                getResourceUrl: false,
            }).outerHTML,
        };
    }
}
