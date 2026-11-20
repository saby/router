import { MAIN_DEPS } from '../../DataAggregators/PageMainDeps';
import { registerStartScriptEvent } from '../../DataAggregators/startScriptCaller';
import { consoleMessage, getRequiredModules, getStaticDependenciesString } from './shared';

/**
 * Стартовый скрипт дефолтного "оживления" страницы
 */
export function getDefaultStartScript(
    requiredModules: string[] | undefined,
    hasWasabyFlag?: boolean
): string {
    const modules = getRequiredModules(requiredModules, MAIN_DEPS);
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
        require([${getStaticDependenciesString(MAIN_DEPS)},${dependencies}],
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
