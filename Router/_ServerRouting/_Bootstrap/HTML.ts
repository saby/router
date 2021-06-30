/// <amd-module name="Router/_ServerRouting/_Bootstrap/HTML" />

// @ts-ignore
import * as HTML from 'text!Router/_ServerRouting/_Bootstrap/HTML.html';
import { detection, constants } from 'Env/Env';
import { IFullData } from 'Router/_ServerRouting/_Bootstrap/Interface';

const newLine = '\n';
interface IRenderFullData extends IFullData {
   moduleName?: string;
}

export function render(values: IRenderFullData): string {
   return [
      '<!DOCTYPE html>',
      '<html lang="ru">',
      '  <head>',
      `    ${values.HeadAPIData}`,
      '  </head>',
      `  <body class="${values.BodyAPIClasses}">`,
      `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">`,
      `      ${values.controlsHTML}`,
      '    </div>',
      '    <div class="wasabyBaseDeps">',
      `      ${values.JSLinksAPIBaseData}`,
      '    </div>',
      '    <div class="wasabyTimeTester">',
      `      ${values.JSLinksAPITimeTesterData}`,
      '    </div>',
      '    <div class="wasabyJSDeps">',
      `      ${values.JSLinksAPIData}`,
      '    </div>',
      '    <div id="wasabyStartScript">',
      `      ${getStartScript(values)}`,
      '    </div>',
      '  </body>',
      '</html>'
   ].join(newLine);
}

function getStartScript(values: IRenderFullData): string {
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
