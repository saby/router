/// <amd-module name="Router/_Builder/_Bootstrap/HTML" />

// @ts-ignore
import * as HTML from 'text!Router/_Builder/_Bootstrap/HTML.html';
import { detection, constants } from 'Env/Env';
import { IFullData, IBuilderOptions } from './Interface';

const newLine = '\n';
interface IRenderFullData extends IFullData {
   moduleName?: string;
}

export function render(values: IRenderFullData): string {
   const htmlLines = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '  <head>',
      `    ${values.HeadAPIData}`,
      '  </head>',
      `  <body class="${values.BodyAPIClasses}">`,
      `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">`,
      `      ${values.controlsHTML}`,
      '    </div>',
      '    <div class="wasabyBaseDeps">',
      `      ${values.JSLinksAPIBaseData}`,
      '    </div>'
   ];
   if (values.JSLinksAPITimeTesterData) {
      htmlLines.push(...[
      '    <div class="wasabyTimeTester">',
      `      ${values.JSLinksAPITimeTesterData}`,
      '    </div>'
      ]);
   }
   if (values.JSLinksAPIData) {
      htmlLines.push(...[
      '    <div class="wasabyJSDeps">',
      `      ${values.JSLinksAPIData}`,
      '    </div>'
      ]);
   }
   htmlLines.push(...[
      '    <div id="wasabyStartScript">',
      `      ${getStartScript(values)}`,
      '    </div>',
      '  </body>',
      '</html>'
   ]);
   return htmlLines.join(newLine);
}

/**
 * Стартовый скрипт, который в браузере "оживляет" страницу
 * @param values
 * @returns
 */
function getStartScript(values: IRenderFullData): string {
   if (values.builderOptions?.builder) {
      return getStaticPageStartScript(values.builderOptions);
   }
   /**
    * Для определенных сценариев тестирования нужно отключать оживление страницы и убирать класс pre-load:
    * https://online.sbis.ru/opendoc.html?guid=9a741529-db8c-4698-a962-9ab5924e113c
    * Отключать оживление можно через query параметр ?isCanceledRevive=true (вместо true можно подставить любое значение)
    */
   if(values.isCanceledRevive) {
      return [
         `<script key="init_script">`,
         `var elementPreloadClass = document.querySelector('.pre-load');`,
         `elementPreloadClass !== null && elementPreloadClass.classList.remove('pre-load');`,
         `</script>`
      ].join(newLine);
   }

   const consoleMessage = 'console.log(\n' +
      "'%c\\tЭта функция браузера предназначена для разработчиков.\\t\\n' +\n" +
      "'\\tЕсли кто-то сказал вам скопировать и вставить что-то здесь, это мошенники.\\t\\n' +\n" +
      "'\\tВыполнив эти действия, вы предоставите им доступ к своему аккаунту.\\t\\n',\n" +
      "'background: red; color: white; font-size: 22px; font-weight: bolder; text-shadow: 1px 1px 2px black;'\n" +
      ');';

   /**
    * Для IE сначала грузим Core/polyfill, чтобы в ядре под IE это все было доступно
    * Поэтому, для IE объявим стартовую функцию, отличную от require
    */
   const mainStart = detection.isIE ? [
      'function requireIE(deps, callBack){ require(["Core/polyfill"], function(){ require(deps, callBack); }); };',
      'requireIE'
   ].join('') : 'require';

   return [
      `<script key="init_script">
document.addEventListener('DOMContentLoaded', function () {
  ${mainStart}(['Env/Env', 'Application/Initializer', 'Application/Env', 'SbisEnvUI/Wasaby', 'UI/Base', 'UI/State', 'Application/State', 'Core/polyfill'],
    function (Env, AppInit, AppEnv, EnvUIWasaby, UIBase, UIState, AppState) {
	   window.startContextData = {
		  AppData: new UIState.AppData({})
		};
		Object.assign(Env.constants, window.wsConfig);
		require(${getRequiredModulesString(values.requiredModules)}, function () {
		  var sr = new AppState.StateReceiver(UIState.Serializer);
		  AppInit.default(window.wsConfig, void 0, sr);
		  UIBase.BootstrapStart({}, document.getElementById('wasaby-content'));
		});
      ${constants.isProduction ? consoleMessage : ''}
  })
});
         </script>`
   ].join(newLine);
}

function getRequiredModulesString(requiredModules: string[]): string {
   if (!requiredModules || !requiredModules.length) {
      return '[]';
   }
   return `['${requiredModules.join('\',\'')}']`;
}

/**
 * Стартовые скрипты для статичных страниц, которые создает builder из файлов name.html.tmpl
 * @param builderOptions
 * @returns
 */
function getStaticPageStartScript(builderOptions: IBuilderOptions): string {
   if (builderOptions.builderCompatible) {
      throw new Error('Обнаружено некорректное использование шаблона статичной страницы. '
         + 'Нельзя строить статичную страницу в режиме совместимости ("compatible" = true)!') ;
   }

   return `<script>
window.receivedStates = '{"ThemesController": {"themes" : {"' + (window.defaultStaticTheme || 'default') + '": true}}}';
document.addEventListener('DOMContentLoaded', function () {
   require(['UICore/Base', 'Application/Initializer', 'Application/Env', 'SbisEnvUI/Compatible', 'UI/Executor',
            'Application/State', 'UI/State', 'UICommon/Deps', 'SbisEnvUI/Wasaby'],
      function (UICore, AppInitializer, AppEnv, Compatible, UIExecutor, AppState, UIState, UIDeps) {
         /*Первый шаг - старт Application, иницализация core и темы. Второй шаг - загрузка ресурсов*/
         AppInitializer.default(window.wsConfig, new AppEnv.EnvBrowser(window['wsConfig']),
                                new AppState.StateReceiver(UIState.Serializer));
         Compatible.AppInit();

         /* Этот же флаг проставляется в UI/Base:Document
         Проблема в том, что при старте html.tmpl-страницы на клиенте, не вызывается UI/Base:Document
         Это должно быть сведено в одну точку */
         UIDeps.headDataStore.write('isNewEnvironment', true);
         // переключаем SbisEnvUI/Bootstrap в режим рендера в div
         AppEnv.setConfig('bootstrapWrapperMode', true);
         window.startContextData = {AppData: new UIState.AppData({})};
         require([${builderOptions.dependencies}], function (){
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
            Compatible.AppStart.createControl(cnt, {}, domElement);
         });
      }
   );
});
      </script>`;
}
