
import * as HTMLTemplate from 'wml!Router/_Bootstrap/HTML';
import * as ControlsHTMLTemplate from 'wml!Router/_Bootstrap/ControlsHTML';

import { Body as AppBody, Head as AppHead, JSLinks as AppJSLinks } from 'Application/Page';
import { logger } from 'Application/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import { addPageDeps, aggregateDependencies, BASE_DEPS_NAMESPACE } from 'UI/Deps';
import { headDataStore } from 'UI/Base';
import { createWsConfig, createDefaultTags } from "UI/Head";

export enum PageSourceStatus {
   OK,  // все хорошо
   NOT_FOUND  // искомый модуль не найден
}

export interface IPageSource {
   status: PageSourceStatus;
   html?: string;
   error?: Error;
}

/**
 * @interface IRenderOptions
 * @property {boolean} bootstrapWrapperMode - флаг, который говорит компоненту SbisEnvUI.Bootstrap строить только контент
 */
export interface IRenderOptions {
   appRoot: string;
   wsRoot: string;
   resourceRoot: string;
   cdnRoot?: string;
   staticDomains: string[];
   logLevel?: string;
   servicesPath: string;
   buildnumber?: string;
   product?: string;
   pageName?: string;
   RUMEnabled?: boolean;
   bootstrapWrapperMode?: boolean;
}

/**
 * @interface IFullData - данные для построения полной страницы
 * @property {string} HeadAPIData         - данные из HeadAPI. Строка вида HTML.
 * @property {string} BodyAPIClasses      - данные из BodyAPI. Строка с классами для <body>.
 * @property {string} JSLinksAPIBaseData  - данные из JSLinksAPI, но с базовыми скриптами. Строка вида HTML.
 * @property {string} JSLinksAPIData      - данные из JSLinksAPI со всеми остальными скриптами. Строка вида HTML.
 * @property {string[]} requiredModules   - массив с именами доп. зависимостей. Они нужны непосредственно для старта.
 * @property {string} controlsHTML        - стррока вида HTML с версткой контролов, полученная на первом шаге.
 */
interface IFullData{
   HeadAPIData: string;
   BodyAPIClasses: string;
   JSLinksAPIBaseData: string;
   JSLinksAPIData: string;

   requiredModules: string[];
   controlsHTML: string;
}

/**
 * Этап 1
 * @param moduleName
 * @param options
 */
function renderControls(moduleName: string, options: IRenderOptions): Promise<string | void> {
   options.bootstrapWrapperMode = true;

   const result: Promise<string> = Promise.resolve(ControlsHTMLTemplate({
      moduleName,
      options
   }, {key: 'bd_'}));

   return result.catch((e) => logger.error(e));
}

/**
 * Этап 2
 * @param moduleName
 * @param options
 * @param controlsHTML
 */
function aggregateFullData(moduleName: string, options: IRenderOptions, controlsHTML: string): IFullData {
   const BodyAPI = AppBody.getInstance();
   const HeadAPI = AppHead.getInstance();
   const JSLinksAPI = AppJSLinks.getInstance();
   const JSLinksAPIBase = AppJSLinks.getInstance(BASE_DEPS_NAMESPACE);

   /** Создаем внутри <head> стандартные тги: wsConfig, кодировка, и прочее. */
   createWsConfig(options);
   createDefaultTags(options);
   /** Добавим текущий модуль moduleName в зависимости (все дочерние добавятся сами, а он - нет) */
   addPageDeps([moduleName]);
   /** Опрашиваем depsCollector на предмет собранных зависимостей. */
   const deps = headDataStore.read('collectDependencies')();
   /** Раскидываем собранные JS и CSS зависимости по HeadAPI и JSLinksAPI */
   aggregateDependencies(options, deps);

   return {
      HeadAPIData: new TagMarkup(HeadAPI.getData().map(fromJML), {getResourceUrl: false}).outerHTML,
      BodyAPIClasses: BodyAPI.getClassString(),
      JSLinksAPIBaseData: new TagMarkup(JSLinksAPIBase.getData().map(fromJML), {getResourceUrl: false}).outerHTML,
      JSLinksAPIData: new TagMarkup(JSLinksAPI.getData().map(fromJML), {getResourceUrl: false}).outerHTML,
      requiredModules: deps.additionalDeps,
      controlsHTML
   };
}

/**
 * Этап 3
 * @param moduleName
 * @param fullData
 */
function renderHTML(moduleName: string, fullData: IFullData): string {
   return HTMLTemplate({...fullData, ...{moduleName}});
}

export function mainRender(moduleName: string, options: IRenderOptions): Promise<IPageSource> {
   return new Promise<IPageSource>((pageResolve) => {
      renderControls(moduleName, options)
         .then((controlsHTML: string = '') => {
            const fullData = aggregateFullData(moduleName, options, controlsHTML);

            pageResolve({
               status: PageSourceStatus.OK,
               html: renderHTML(moduleName, fullData)
            });
         });
   });
}
