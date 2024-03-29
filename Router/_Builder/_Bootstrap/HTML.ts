import { detection, constants } from 'Env/Env';
import { IFullData, IBuilderOptions } from './Interface';
import { controller } from 'I18n/i18n';
import { storageKey } from './DataAggregators/LoadingStatus';

const newLine = '\n';
const removeNewLinePattern = /(\r\n|\n|\r|)/gm;
const removeDoubleWhiteSpaces = /\s+/;
interface IRenderFullData extends IFullData {
    moduleName?: string;
}

export function render(values: IRenderFullData): string {
    return [
        '<!DOCTYPE html>',
        `<html lang=${controller.currentLang || 'ru'}>`,
        '  <head>',
        `    ${values.HeadAPIData}`,
        '  </head>',
        `  <body ${_private.getBodyAttrs(values)}>`,
        `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">`,
        `      ${values.controlsHTML}`,
        '    </div>',
        _private.getBaseScripts(values),
        _private.getTimeTesterScripts(values),
        _private.getDepsScripts(values),
        '    <div id="wasabyStartScript">',
        `      ${_private.prepareScript(getStartScript(values))}`,
        '    </div>',
        '  </body>',
        '</html>',
    ].join(newLine);
}

/**
 * Стартовый скрипт, который в браузере "оживляет" страницу
 * @param values
 * @returns
 */
function getStartScript(values: IRenderFullData): string {
    if (values.isCanceledRevive || values.prerender) {
        return _private.getEmptyStartScript();
    }

    if (values.builderOptions?.builder) {
        return _private.getStaticPageStartScript(values.builderOptions);
    }

    const consoleMessage =
        'console.log(\n' +
        "'%c\\tЭта функция браузера предназначена для разработчиков.\\t\\n' +\n" +
        "'\\tЕсли кто-то сказал вам скопировать и вставить что-то здесь, это мошенники.\\t\\n' +\n" +
        "'\\tВыполнив эти действия, вы предоставите им доступ к своему аккаунту.\\t\\n',\n" +
        "'background: red; color: white; font-size: 22px; font-weight: bolder; text-shadow: 1px 1px 2px black;'\n" +
        ');';

    /**
     * Для IE сначала грузим пакет с полифиллами, чтобы в ядре под IE это все было доступно
     * Поэтому, для IE объявим стартовую функцию, отличную от require
     */
    const mainStart = detection.isIE
        ? [
              'function requireIE(deps, callBack){ require(["SbisUI/polyfill"], function(){ require(deps, callBack); }); };',
              'requireIE',
          ].join('')
        : 'require';

    return [
        `<script key="init_script">
document.addEventListener('DOMContentLoaded', function () {
  ${mainStart}(['Env/Env', 'Application/Initializer', 'Application/Env', 'SbisUI/Wasaby', 'UI/Base', 'UI/State', 'Application/State', 'Router/router', 'SbisUI/polyfill'],
    function(Env, AppInit, AppEnv, EnvUIWasaby, UIBase, UIState, AppState, router){
		Object.assign(Env.constants, window.wsConfig);
		require(${_private.getRequiredModulesString(
            values.requiredModules
        )}, function(){
		  var sr = new AppState.StateReceiver(UIState.Serializer);
		  AppInit.default(window.wsConfig, void 0, sr);
        var setSpaHistory = function(spaHistory) { window.spaHistory = spaHistory; };
		  UIBase.BootstrapStart({ Router: router.getRootRouter(false, setSpaHistory), isAdaptive: AppEnv.getConfig('isAdaptive') }, document.getElementById('wasaby-content'));
        try {
          window.sessionStorage.removeItem('${storageKey}');
        } catch(err) { /* sessionStorage недоступен */}
		});
      ${constants.isProduction ? consoleMessage : ''}
  })
});
         </script>`,
    ].join('');
}

/** ***************************************************************************************************************** */

const _private = {
    getRequiredModulesString(requiredModules: string[] | undefined): string {
        if (!requiredModules || !requiredModules.length) {
            return '[]';
        }
        return `['${requiredModules.join("','")}']`;
    },

    /**
     * Для определенных сценариев тестирования нужно отключать оживление страницы и убирать класс pre-load:
     * https://online.sbis.ru/opendoc.html?guid=9a741529-db8c-4698-a962-9ab5924e113c
     * Отключать оживление можно через query параметр ?isCanceledRevive=true (вместо true можно подставить любое значение)
     * *
     * Существуют также ситуации, когда и на бою нам не нужен стартовый скрипт. Например, быстрый запрос за данными
     * Актуально для Google Chrome, например
     * https://online.sbis.ru/opendoc.html?guid=9a500336-5855-4d08-9c69-b27a54ff2e37
     */
    getEmptyStartScript(): string {
        return `<script key="init_script">
         var elementPreloadClass = document.querySelector('.pre-load');
         elementPreloadClass !== null && elementPreloadClass.classList.remove('pre-load');
         </script>`;
    },

    /**
     * Стартовые скрипты для статичных страниц, которые создает builder из файлов name.html.tmpl
     * @param builderOptions
     * @returns Возвращает стартовые скрипты
     */
    getStaticPageStartScript(builderOptions: IBuilderOptions): string {
        if (builderOptions.builderCompatible) {
            throw new Error(
                'Обнаружено некорректное использование шаблона статичной страницы. ' +
                    'Нельзя строить статичную страницу в режиме совместимости ("compatible" = true)!'
            );
        }

        const dependencies =
            typeof builderOptions.dependencies === 'string'
                ? builderOptions.dependencies
                : builderOptions.dependencies
                      .map((v) => {
                          return `'${v}'`;
                      })
                      .toString();

        return `<script>
window.receivedStates = '{"ThemesController": {"themes" : {"' + (window.defaultStaticTheme || 'default') + '": true}}}';
document.addEventListener('DOMContentLoaded', function () {

   /**
    * Для престо на специфичном устройстве cначала грузим полифилы.
    * Библиотека io-Bundle не выдает для 52 хрома полифил под Object.entries
    * 52 Хром тут https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win_x64/389347/
    * Лайв версия io-Bundles тут (запускать из 52 хрома) https://polyfill.io/v3/polyfill.min.js
    * TODO: Выпиливается https://online.sbis.ru/opendoc.html?guid=b66f1222-1175-494f-9a1d-679d488afde2
    */
   var requirePolyfill = require;
   if (window.needPolyfill) {
      requirePolyfill = function requireIE(deps, callBack){
         require(['Core/polyfill/Object/values-entries'], function(){ require(deps, callBack); });
      };
   };

   requirePolyfill(['UICore/Base', 'Application/Initializer', 'Application/Env', 'SbisUI/Compatible', 'UI/Executor',
            'Application/State', 'UI/State', 'Router/router', 'SbisUI/Wasaby'],
      function(UICore, AppInitializer, AppEnv, Compatible, UIExecutor, AppState, UIState, router){
         /*Первый шаг - старт Application, иницализация core и темы. Второй шаг - загрузка ресурсов*/
         AppInitializer.default(window.wsConfig, new AppEnv.EnvBrowser(window['wsConfig']),
                                new AppState.StateReceiver(UIState.Serializer));
         Compatible.AppInit();

         require([${dependencies}], function(){
            var templateFn = ${builderOptions.builder};
            templateFn.stable = true;
            var cnt = UICore.Control.extend({
               _template: templateFn
            });
            cnt.defaultProps = {
               notLoadThemes: true
            };
            Compatible.AppStart._shouldStart = false;
            var domElement = UICore.selectRenderDomNode(document.getElementById('wasaby-content'));
            var setSpaHistory = function(spaHistory) { window.spaHistory = spaHistory; };
            Compatible.AppStart.createControl(cnt, { Router: router.getRootRouter(false, setSpaHistory) }, domElement);
            try {
               window.sessionStorage.removeItem('${storageKey}');
            } catch(err) { /* sessionStorage недоступен */}
         });
      }
   );
});
      </script>`;
    },

    getBodyAttrs(values: IRenderFullData): string {
        const bodyAttrs: string[] = [];
        if (values.BodyAPIClasses) {
            bodyAttrs.push(`class="${values.BodyAPIClasses}"`);
        }

        if (values.directionality) {
            bodyAttrs.push(`dir="${values.directionality}"`);
        }
        return bodyAttrs.join(' ');
    },

    getBaseScripts(values: IRenderFullData): string {
        if (!values.JSLinksAPIBaseData) {
            return '';
        }

        return [
            '    <div class="wasabyBaseDeps">',
            `      ${values.JSLinksAPIBaseData}`,
            '    </div>',
        ].join(newLine);
    },

    getTimeTesterScripts(values: IRenderFullData): string {
        if (!values.JSLinksAPITimeTesterData) {
            return '';
        }

        return [
            '    <div class="wasabyTimeTester">',
            `      ${values.JSLinksAPITimeTesterData}`,
            '    </div>',
        ].join(newLine);
    },

    getDepsScripts(values: IRenderFullData): string {
        if (!values.JSLinksAPIData) {
            return '';
        }

        return [
            '    <div class="wasabyJSDeps">',
            `      ${values.JSLinksAPIData}`,
            `      ${_private.addRenderTime(values)}`,
            '    </div>',
        ].join(newLine);
    },

    prepareScript(str: string): string {
        return str
            .replace(removeNewLinePattern, '')
            .replace(removeDoubleWhiteSpaces, ' ');
    },

    /**
     * Добавление вычисленного времени рендера верстки на сервере
     */
    addRenderTime(values: IRenderFullData): string {
        if (!values.renderStartTime) {
            return '';
        }
        const ssrTime = Date.now() - values.renderStartTime;
        return `<script type="text/javascript">
         window['ssrTime'] = ${ssrTime};
         </script>`;
    },
};
