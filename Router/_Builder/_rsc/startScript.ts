import type { IRenderFullData } from '../_Bootstrap/html/startScript';
import { storageKey, LoadingStatus } from '../_Bootstrap/DataAggregators/LoadingStatus';
import { MAIN_DEPS } from '../_Bootstrap/DataAggregators/PageMainDeps';

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
        async function loadClientModule(metadata) {
            const promise = new Promise((res, rej) => {
                const idBase = metadata.id.split('#')[0];
                const modulePath = idBase.replace('./', '/');
                console.log('Loading client module:', modulePath);
                const module = require([modulePath], (module)=> {
                    res(module[metadata.name] || module.default || module);
                }, rej);
            }).catch((error) => {
                console.error('Failed to load client module:', metadata.id, error);
                return function Placeholder() {
                    return React.createElement('div', { style: { color: 'red' } },
                        'Failed to load client component: ' + metadata.id
                    );
                };
            });

            return promise;
        }

        require(['react-dom/client', 'UICore/_rsc/client/rsc-client', 'Env/Constants', 'UI/Base', 'Router/router', 'WasabyLoader/ModulesLoader',${dependencies}],
        function(reactDom, rscClient, Env, UIBase, router, ModulesLoader){
            if (performance && performance.mark) {
                performance.mark('SCRIPTS COMPILING END');
                performance.mark('CORE INIT START');
            }

            const moduleLoader = {
                requireModule: async function(metadata) {
                    console.log('Requiring module:', metadata);
                    return loadClientModule(metadata);
                },
                preloadModule: function(metadata) {
                    console.log('Preloading module:', metadata);
                }
            };

            const payload = window.__payload__;

            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode(payload));
                    controller.close();
                }
            });

            rscClient.createFromReadableStream(stream, {
                moduleLoader: moduleLoader
            }).then((root) => {
                reactDom.hydrateRoot(document.getElementById('wasaby-content'), root);
                ModulesLoader.initWarmup();
                try {
                    window.sessionStorage.removeItem('${storageKey}');
                } catch(err) { /* sessionStorage недоступен */}
                if (performance && performance.mark) {
                    performance.mark('CORE INIT END');
                }
            });
            ${consoleMessage}
        }, function(err) { console.error(err); });`;
}

function getRequiredModulesString(requiredModules: string[] | undefined): string {
    if (!requiredModules || !requiredModules.length) {
        return '';
    }
    return `'${requiredModules.join("','")}'`;
}

/**
 * Стартовый скрипт, который в браузере "оживляет" страницу
 */
export default function getStartScript(values: IRenderFullData): string {
    const scripts = [
        `<script key="init_script">
         var elementPreloadClass = document.querySelector('.pre-load');
         elementPreloadClass !== null && elementPreloadClass.classList.remove('pre-load');`,
    ];

    if (values.requiredModules && values.requiredModules.length) {
        const requiredModules = getRequiredModulesString(
            (values.requiredModules || []).filter((dep) => {
                return !MAIN_DEPS.includes(dep);
            })
        );
        scripts.push(`
            window.startScript = function() {
                delete window.startScript;
                ${LoadingStatus.getRemoveEventListener()}
                ${getBaseStartScript(requiredModules)}
            };`);
    }

    scripts.push('</script>');

    return scripts.join('\n');
}
