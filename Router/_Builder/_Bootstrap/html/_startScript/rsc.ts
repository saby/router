import { newLine } from '../htmlParts';
import { consoleMessage, getRequiredModules, removePreLoadScript } from './shared';

/**
 * Стартовый скрипт для "оживления" страницы на серверных компонентах (RSC)
 */
export function getRscStartScript(requiredModules: string[] | undefined): string {
    const scripts = [
        `<script key="init_script">
        ${removePreLoadScript}`,
    ];

    if (requiredModules && requiredModules.length) {
        const modules = getRequiredModules(requiredModules);
        scripts.push(`
            window.startScript = function() {
                delete window.startScript;
                ${getRscBaseStartScript(modules)}
            };`);
    }

    scripts.push('</script>');

    return scripts.join(newLine);
}

/**
 * Тело стартового скрипта для RSC-оживления страницы
 */
function getRscBaseStartScript(dependencies: string): string {
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

        require(['react-dom/client', 'UICore/_rsc/client/rsc-client', 'Env/Constants', 'WasabyLoader/ModulesLoader',${dependencies}],
        function(reactDom, rscClient, Env, ModulesLoader){
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
                if (performance && performance.mark) {
                    performance.mark('CORE INIT END');
                }
            });
            ${consoleMessage}
        }, function(err) { console.error(err); });`;
}
