import { IFullData, IBuilderOptions } from '../Interface';

import { storageKey, LoadingStatus } from '../DataAggregators/LoadingStatus';
import { getResourceUrl } from 'UI/Utils';
import { REQUIRE_CONFIG, REQUIRE_PATH } from '../DataAggregators/BaseScripts';
import { MAIN_DEPS } from '../DataAggregator';

export const newLine = '\n';

/**
 * @private
 */
export interface IRenderFullData extends IFullData {
    moduleName?: string;
    lang?: string;
}

/**
 * Стартовый скрипт, который в браузере "оживляет" страницу
 */
export function getStartScript(values: IRenderFullData): string {
    if (values.isCanceledRevive || values.prerender) {
        return getEmptyStartScript();
    }

    if (values.builderOptions?.builder) {
        return getStaticPageStartScript(values.builderOptions);
    }

    if (values.builderOptions?.buildStateless) {
        return getStatelessStaticPageStartScript(values.builderOptions.dependencies);
    }

    const requiredModules = getRequiredModulesString(
        (values.requiredModules || []).filter((dep) => {
            return !MAIN_DEPS.includes(dep);
        })
    );
    return `<script key="init_script">
window.startScript = function() {
    delete window.startScript;
    ${LoadingStatus.getRemoveEventListener()}
    ${getBaseStartScript(requiredModules)}
};
document.addEventListener('DOMContentLoaded', function () {
    if (window.readyToStartScript === false) {
        return;
    }
    if (window.startScript) {
        window.startScript();
    }
});
         </script>`;
}

function getRequiredModulesString(requiredModules: string[] | undefined): string {
    if (!requiredModules || !requiredModules.length) {
        return '';
    }
    return `'${requiredModules.join("','")}'`;
}
function getBaseStartScript(dependencies: string): string {
    const consoleMessage = `
        if (Env.constants.isProduction) {
            console.log(
                '%c\\tЭта функция браузера предназначена для разработчиков.\\t\\n' +
                '\\tЕсли кто-то сказал вам скопировать и вставить что-то здесь, это мошенники.\\t\\n' +
                '\\tВыполнив эти действия, вы предоставите им доступ к своему аккаунту.\\t\\n',
                'background: red; color: white; font-size: 22px; font-weight: var(--font-weight-bold)er; text-shadow: 1px 1px 2px black;'
            );
        }`;

    return `
        require(['Env/Env', 'Application/Initializer', 'Application/Env', 'SbisUI/Wasaby', 'UI/Base', 'UI/State',
            'Application/State', 'Router/router', 'WasabyLoader/ModulesLoader',${dependencies}],
        function(Env, AppInit, AppEnv, EnvUIWasaby, UIBase, UIState, AppState, router, ModulesLoader){
            if (performance && performance.mark) {
                performance.mark('SCRIPTS COMPILING END');
                performance.mark('CORE INIT START');
            }
            var sr = new AppState.StateReceiver(UIState.Serializer);
            AppInit.default(window.wsConfig, void 0, sr);
            ${getOnChangeStateHandler()}
            var Router = router.getRootRouter(false, onChangeState);
            UIBase.BootstrapStart({ Router: Router }, document.getElementById('wasaby-content'));
            ModulesLoader.initWarmup();
            try {
                window.sessionStorage.removeItem('${storageKey}');
            } catch(err) { /* sessionStorage недоступен */}
            if (performance && performance.mark) {
                performance.mark('CORE INIT END');
            }
            ${consoleMessage}
        }, function(err) { console.error(err); });`;
}

/*
 * Для определенных сценариев тестирования нужно отключать оживление страницы и убирать класс pre-load:
 * https://online.sbis.ru/opendoc.html?guid=9a741529-db8c-4698-a962-9ab5924e113c
 * Отключать оживление можно через query параметр ?isCanceledRevive=true (вместо true можно подставить любое значение)
 * *
 * Существуют также ситуации, когда и на бою нам не нужен стартовый скрипт. Например, быстрый запрос за данными
 * Актуально для Google Chrome, например
 * https://online.sbis.ru/opendoc.html?guid=9a500336-5855-4d08-9c69-b27a54ff2e37
 */
function getEmptyStartScript(): string {
    return `<script key="init_script">
         var elementPreloadClass = document.querySelector('.pre-load');
         elementPreloadClass !== null && elementPreloadClass.classList.remove('pre-load');
         </script>`;
}

/**
 * Возвращает стартовые скрипты для статичных страниц, которые создает builder из файлов name.html.tmpl
 */
function getStaticPageStartScript(builderOptions: IBuilderOptions): string {
    if (builderOptions.builderCompatible) {
        throw new Error(
            'Обнаружено некорректное использование шаблона статичной страницы. ' +
                'Нельзя строить статичную страницу в режиме совместимости ("compatible" = true)!'
        );
    }

    const dependencies = getStaticDependenciesString(builderOptions.dependencies);

    return `<script>
window.receivedStates = '{"ThemesController": {"themes" : {"' + (window.defaultStaticTheme || 'default') + '": true}}}';
window.addEventListener('load', function () {
   /* Шаблоны старой кодогенерации зависят от UI/Executor, новой - от Compiler/IR */
   require(['Env/Env', 'UICore/Base', 'Application/Initializer', 'Application/Env', 'SbisUI/Compatible',
            'Application/State', 'UI/State', 'Router/router', 'SbisUI/Wasaby', 'UI/Executor', 'Compiler/IR'],
      function(Env, UICore, AppInitializer, AppEnv, Compatible, AppState, UIState, router){
         /*Первый шаг - старт Application, иницализация core и темы. Второй шаг - загрузка ресурсов*/
         AppInitializer.default(window.wsConfig, new AppEnv.EnvBrowser(window['wsConfig']),
                                new AppState.StateReceiver(UIState.Serializer));
         Compatible.AppInit();

         require(['WasabyLoader/ModulesLoader',${dependencies}], function(ModulesLoader){ModulesLoader.initWarmup();
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
            ${getOnChangeStateHandler()}
            var Router = router.getRootRouter(false, onChangeState);
            Compatible.AppStart.createControl(cnt, { Router: Router }, domElement);
            ModulesLoader.initWarmup();
            try {
               window.sessionStorage.removeItem('${storageKey}');
            } catch(err) { /* sessionStorage недоступен */}
         });
      }
   );
});
      </script>`;
}

/**
 * Стартовый скрипт для "stateless" статичной страницы
 */
function getStatelessStaticPageStartScript(dependencies: string[]): string {
    const requiredModules = getStaticDependenciesString(dependencies);
    return `<script key="init_script">
        window.addEventListener('load', function () {
            var wasabyBaseDeps = document.head;
            function addScript(src, key, resolve, reject) {
                var _script = document.createElement('script');
                _script.src = src;
                _script.onload = function () {
                    resolve();
                };
                _script.onerror = function (event) {
                    onErrorHandler(key);
                    reject();
                };
                wasabyBaseDeps.appendChild(_script);
            }
            var contentsPromise = new Promise((resolve, reject) => {
                var contentsPath = window.wsConfig.metaRoot + 'contents.min.js';
                addScript(contentsPath, 'contents', resolve, reject);
            });
            contentsPromise.then(function () {
                /* buildnumber можем достать только из contents.js */
                var bNumber = window.contents.buildnumber;
                window.wsConfig.buildnumber = bNumber;
                window.buildnumber = bNumber;
                if (window.contents && window.contents.modules && window.contents.modules.RequireJsLoader && window.contents.modules.RequireJsLoader.buildnumber) {
                    bNumber = window.contents.modules.RequireJsLoader.buildnumber;
                }
                var requirePromise = new Promise((resolve, reject) => {
                    var requrePath = window.wsConfig.resourceRoot + '${REQUIRE_PATH}.min.js?x_module=' + bNumber;
                    addScript(
                        requrePath,
                        'require',
                        function () {
                            window.initRequire('require');
                            resolve();
                        },
                        reject
                    );
                });
                requirePromise.then(function () {
                    const configPromise = new Promise((resolve, reject) => {
                        var configPath = window.wsConfig.resourceRoot + '${REQUIRE_CONFIG}.min.js?x_module=' + bNumber;
                        addScript(configPath, 'config', resolve, reject);
                    });
                    const routerPromise = new Promise((resolve, reject) => {
                        var routerPath = window.wsConfig.metaRoot + 'router.min.js';
                        addScript(routerPath, 'router', resolve, reject);
                    });
                    Promise.all([configPromise, routerPromise]).then(() => {
                        ${getStatelessBaseStartScript(requiredModules)}
                    });
                });
            });
        });
        </script>`;
}

function getStatelessBaseStartScript(dependencies: string): string {
    return `
        require(['Env/Env', 'Application/Initializer', 'Application/Env', 'SbisUI/Wasaby', 'UI/Base', 'UI/State', 'Application/State', 'Router/router', 'SbisUI/polyfill'],
        function(Env, AppInit, AppEnv, EnvUIWasaby, UIBase, UIState, AppState, router){
            Object.assign(Env.constants, window.wsConfig);
            require(['WasabyLoader/ModulesLoader',${dependencies}], function(ModulesLoader){
                if (performance && performance.mark) {
                    performance.mark('SCRIPTS COMPILING END');
                    performance.mark('CORE INIT START');
                }
                var sr = new AppState.StateReceiver(UIState.Serializer);
                AppInit.default(window.wsConfig, void 0, sr);
                ${getOnChangeStateHandler()}
                var Router = router.getRootRouter(false, onChangeState);
                UIBase.BootstrapStart({ Router: Router }, document.getElementById('wasaby-content'));
                ModulesLoader.initWarmup();
                try {
                    window.sessionStorage.removeItem('${storageKey}');
                } catch(err) { /* sessionStorage недоступен */}
                if (performance && performance.mark) {
                    performance.mark('CORE INIT END');
                }
            }, function(err) { console.error(err); });
        }, function(err) { console.error(err); });`;
}

export function getBodyAttrs(values: IRenderFullData): string {
    const bodyAttrs: string[] = [];
    if (values.BodyAPIClasses) {
        bodyAttrs.push(`class="${values.BodyAPIClasses}"`);
    }

    if (values.directionality) {
        bodyAttrs.push(`dir="${values.directionality}"`);
    }
    return bodyAttrs.join(' ');
}

export function getBaseScripts(values: IRenderFullData): string {
    if (!values.JSLinksAPIBaseData) {
        return '';
    }

    return [
        '    <div class="wasabyBaseDeps">',
        `      ${values.JSLinksAPIBaseData}`,
        '    </div>',
    ].join(newLine);
}

export function getTimeTesterScripts(values: IRenderFullData): string {
    if (!values.JSLinksAPITimeTesterData) {
        return '';
    }

    return [
        '    <div class="wasabyTimeTester">',
        `      ${values.JSLinksAPITimeTesterData}`,
        '    </div>',
    ].join(newLine);
}

export function getDepsScripts(values: IRenderFullData): string {
    const renderTime = getRenderTimeScript(values);
    if (!values.JSLinksAPIData && !renderTime) {
        return '';
    }

    const result = ['<div class="wasabyJSDeps">'];
    if (values.JSLinksAPIData) {
        result.push(values.JSLinksAPIData);
    }
    if (renderTime) {
        result.push(renderTime);
    }
    result.push('    </div>');
    return result.join(newLine);
}

/**
 * Добавление вычисленного времени рендера верстки на сервере
 */
function getRenderTimeScript(values: IRenderFullData): string {
    if (!values.renderStartTime) {
        return '';
    }
    const ssrTime = Date.now() - values.renderStartTime;
    return `<script>window['ssrTime'] = ${ssrTime};</script>`;
}

function getOnChangeStateHandler() {
    const METHOD_OBJECT_NAME = 'PSWaSabyRouting';

    // calcMethodName - Вычисление "названия" метода построившего текущую страницу по правилам СП.
    // onChangeState - обработчик, который будет вызываться каждый раз, когда меняется url в адресной строке.
    return `var calcMethodName = function(url, maskResolver) {
            if (url === '/') {
                return '${METHOD_OBJECT_NAME}.index_html';
            }
            var params = maskResolver.calculateUrlParams('/:component/:pageId', url);
            if (params.component === 'page') {
                /* pagex */
                return '${METHOD_OBJECT_NAME}.' + params.pageId;
            }
            var hyphen = params.component ? '-' : '';
            return '${METHOD_OBJECT_NAME}.' + params.component + hyphen + 'Index';
        };

        var onChangeState = function(newState) {
            if (newState.spaHistory) { window.spaHistory = newState.spaHistory; }
            if (newState.href && Router) {
                var pageName = calcMethodName(newState.href, Router.maskResolver);
                window['X-CURRENTMETHOD'] = pageName;
                Env.constants.pageName = pageName;
            };
        };`;
}

export function getCheckSoftware(): string {
    return `<script async src="${getResourceUrl(
        '/cdn/Maintenance/1.0.44/js/checkSoftware.min.js'
    )}"></script>`;
}

export function getMaintenanceContainer(): string {
    return '<div id="sbisEnvUI_errorContainer"></div>';
}

function getStaticDependenciesString(dependencies: string[]): string {
    return typeof dependencies === 'string'
        ? dependencies
        : dependencies
              .map((v) => {
                  return `'${v}'`;
              })
              .toString();
}
