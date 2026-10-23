import { REQUIRE_PATH } from '../../DataAggregators/BaseScripts';
import { getStaticDependenciesString } from './shared';

/**
 * Стартовый скрипт для "stateless" статичной страницы
 */
export function getStatelessStaticPageStartScript(dependencies: string[]): string {
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
                    const routerPromise = new Promise((resolve, reject) => {
                        var routerPath = window.wsConfig.metaRoot + 'router.min.js';
                        addScript(routerPath, 'router', resolve, reject);
                    });
                    routerPromise.then(() => {
                        ${getStatelessBaseStartScript(requiredModules)}
                    });
                });
            });
        });
        </script>`;
}

function getStatelessBaseStartScript(dependencies: string): string {
    return `
        require(['Env/Constants', 'UI/Start', 'Router/router', 'SbisUI/polyfill'],
        function(Env, UIStart, router){
            require(['WasabyLoader/ModulesLoader',${dependencies}], function(ModulesLoader){
                if (performance && performance.mark) {
                    performance.mark('SCRIPTS COMPILING END');
                    performance.mark('CORE INIT START');
                }
                UIStart.BootstrapStart({ routerCreator: router.getRootRouter }, document.getElementById('wasaby-content'), window.wsConfig);
                ModulesLoader.initWarmup();
                if (performance && performance.mark) {
                    performance.mark('CORE INIT END');
                }
            }, function(err) { console.error(err); });
        }, function(err) { console.error(err); });`;
}
