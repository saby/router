/**
 * Рендеринг статичной страницы в билдере
 * @library
 * @private
 * @author Мустафин Л.И.
 * @module
 */

export { TIMETESTER_SCRIPTS_NAMESPACE } from './_Builder/_Bootstrap/DataAggregators/UtilsScripts';
export { IRenderOptions, IPageConfig } from './_Builder/_Bootstrap/Interface';
export { renderHTMLforOldRoutes } from './_Builder/_Bootstrap/renderHTMLforOldRoutes';
export { renderStatic, IRenderBuilderOptions } from './_Builder/Static';
export { initPageRenderer, getPageRenderer } from './_Builder/Bootstrap';
export { logPartialSend } from './_Builder/_Bootstrap/PageRenderer';
