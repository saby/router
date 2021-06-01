/// <amd-module name="Router/Builder" />

/**
 * Рендеринг статичной страницы в билдере
 * @library Router/Builder
 * @private
 * @author Мустафин Л.И.
 */

import { IFullData, IRenderOptions } from './_Builder/_Bootstrap/Interface';
import { aggregateFullData, mainRender } from './_Builder/Bootstrap';
import { render } from './_Builder/_Bootstrap/HTML';

export { mainRender, IRenderOptions };

/**
 * Рендер html для статичных страниц, которые генерятся из файлов вида name.html.tmpl в builder
 */
export function renderStatic(options: IRenderOptions): string {
    // специально указываем пустой moduleName, т.к. что строить уже вшито в options._options.builder
    const moduleName = '';
    const fullData: IFullData = aggregateFullData(moduleName, options, '<div></div>');
    fullData.builderOptions = {
        builder: options._options.builder,
        builderCompatible: options._options.builderCompatible,
        dependencies: options._options.dependencies
    };
    return render({...fullData, moduleName});
}