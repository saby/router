
import * as ControlsHTMLTemplate from 'wml!Router/_ServerRouting/_Bootstrap/ControlsHTML';

import { Body as AppBody, Head as AppHead, JSLinks as AppJSLinks } from 'Application/Page';
import { logger, setConfig } from 'Application/Env';
import { TagMarkup, fromJML } from 'UI/Base';
import { addPageDeps, aggregateDependencies, BASE_DEPS_NAMESPACE, headDataStore } from 'UI/Deps';
import { createWsConfig, createTitle } from 'UI/Head';

/**
 * @interface IRenderOptions
 * @property {boolean} bootstrapWrapperMode - флаг, который говорит компоненту SbisEnvUI.Bootstrap строить только контент
 * @property {object} pageConfig - поле, в котором будут лежать предзагруженные данные для построения страницы
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
   application: string;
   pageConfig: {title?: string} | false;
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
   setConfig('bootstrapWrapperMode', true);

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

   /** Вполне возможно, что никто не успел создать title. Нужно сделать его самим из дефолтного поля */
   createTitle(options.pageConfig ? options.pageConfig.title || '' : '');
   /** Создаем внутри <head> стандартные теги: wsConfig, кодировка, и прочее. */
   createWsConfig(options);
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

function getRequiredModulesString(requiredModules: string[]): string {
   if (!requiredModules || !requiredModules.length) {
      return '[]';
   }
   return requiredModules.join('","');
}

/**
 * Этап 3
 * @param moduleName
 * @param fullData
 */
function renderHTML(moduleName: string, fullData: IFullData): string {
    return HTMLTemplate({ ...fullData, ...{moduleName}});
}

export function mainRender(moduleName: string, options: IRenderOptions): Promise<string> {
   return new Promise((pageResolve) => {
      renderControls(moduleName, options)
         .then((controlsHTML: string = '') => {
            const fullData = aggregateFullData(moduleName, options, controlsHTML);

            pageResolve(renderHTML(moduleName, fullData));
         });
   });
}



function HTMLTemplate(values: IFullData & { moduleName?: string }): string {
    const HeadAPIData = values.HeadAPIData || '';
    const BodyAPIClasses = values.BodyAPIClasses || '';
    const moduleName = values.moduleName || '';
    const controlsHTML = values.controlsHTML || '';
    const JSLinksAPIBaseData = values.JSLinksAPIBaseData || '';
    const JSLinksAPIData = values.JSLinksAPIData || '';
    const requiredModules = getRequiredModulesString(values.requiredModules || []);

    return `<!DOCTYPE html><html lang="en"><head>${ HeadAPIData }</head><body class="${ BodyAPIClasses }"><div id="wasaby-content" style="width:inherit;height:inherit" application="${ moduleName }">${ controlsHTML }</div><div class="wasabyBaseDeps">${ JSLinksAPIBaseData }</div><div class="wasabyJSDeps">${ JSLinksAPIData }</div><div id="wasabyStartScript"><div key="scripts"><script key="init_script">document.addEventListener('DOMContentLoaded', function() {
    let steps = [
        /* запуск ядра по умолчанию для всех браузеров */
        {
            deps: ['Env/Env', 'Application/Initializer', 'Application/Env', 'SbisEnvUI/Wasaby',
                'UI/Base', 'UI/State', 'Application/State', 'Core/polyfill'],
            callback: function(Env, AppInit, AppEnv, EnvUIWasaby, UIBase, UIState, AppState) {
                window.startContextData = {AppData: new UIState.AppData({})};
                Object.assign(Env.constants, window.wsConfig);
                require(["${ requiredModules }"], function() {
                    var sr = new AppState.StateReceiver(UIState.Serializer);
                    AppInit.default(window.wsConfig, void 0, sr);
                    UIBase.BootstrapStart({}, document.getElementById('wasaby-content'));
                });
                if (Env.constants.isProduction) {
                    console.log(
                        '%c\tЭта функция браузера предназначена для разработчиков.\t\n' +
                        '\tЕсли кто-то сказал вам скопировать и вставить что-то здесь, это мошенники.\t\n' +
                        '\tВыполнив эти действия, вы предоставите им доступ к своему аккаунту.\t\n',
                        'background: red; color: white; font-size: 22px; font-weight: bolder; text-shadow: 1px 1px 2px black;'
                    );
                }
            }
        }
    ];
    if (false) {  //isIE
        /* для IE сначала грузим polyfill, чтобы в ядре под IE это все было доступно */
        steps.unshift({
            deps: ['Core/polyfill'],
            callback: function() {}
        })
    }

    function startApplication(steps) {
        let step = steps.shift();
        require(step.deps, function() {
            step.callback.apply(this, arguments);
            if (steps.length) {
                startApplication(steps);
            }
        })
    }

    startApplication(steps);
});</script></div></div></body></html>`;
}