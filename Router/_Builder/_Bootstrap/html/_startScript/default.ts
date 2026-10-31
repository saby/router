import { registerStartScriptEvent } from '../../DataAggregators/startScriptCaller';
import { consoleMessage, getRequiredModules } from './shared';

/**
 * Стартовый скрипт дефолтного "оживления" страницы
 */
export function getDefaultStartScript(
    requiredModules: string[] | undefined,
    hasWasabyFlag?: boolean
): string {
    const modules = getRequiredModules(requiredModules);
    return `<script key="init_script">
window.startScript = function() {
    delete window.startScript;
    ${getBaseStartScript(modules, hasWasabyFlag === true)}
};
${registerStartScriptEvent}
</script>`;
}

function getBaseStartScript(dependencies: string, hasWasabyFlag: boolean): string {
    return `
        require(['Env/Constants', 'UI/Start', 'Router/router', 'WasabyLoader/ModulesLoader',${dependencies}],
        function(Env, UIStart, router, ModulesLoader){
            if (performance && performance.mark) {
                performance.mark('SCRIPTS COMPILING END');
                performance.mark('CORE INIT START');
            }
            UIStart.BootstrapStart({ routerCreator: router.getRootRouter, hasWasaby: ${hasWasabyFlag} }, document.getElementById('wasaby-content'), window.wsConfig);
            ModulesLoader.initWarmup();
            if (performance && performance.mark) {
                performance.mark('CORE INIT END');
            }
            ${consoleMessage}
        }, function(err) { console.error(err); });`;
}
