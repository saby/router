import { MAIN_DEPS } from '../../DataAggregators/PageMainDeps';

/**
 * Предупреждение для разработчиков, которое выводится в консоль на боевом стенде
 */
export const consoleMessage = `
        if (Env.constants.isProduction) {
            console.log(
                '%c\\tЭта функция браузера предназначена для разработчиков.\\t\\n' +
                '\\tЕсли кто-то сказал вам скопировать и вставить что-то здесь, это мошенники.\\t\\n' +
                '\\tВыполнив эти действия, вы предоставите им доступ к своему аккаунту.\\t\\n',
                'background: red; color: white; font-size: 22px; font-weight: var(--font-weight-bold)er; text-shadow: 1px 1px 2px black;'
            );
        }`;

export const removePreLoadScript = `var elementPreloadClass = document.querySelector('.pre-load');
elementPreloadClass !== null && elementPreloadClass.classList.remove('pre-load');`;

/**
 * Строка с зависимостями стартового скрипта без базовых модулей страницы
 */
export function getRequiredModules(requiredModules: string[] | undefined): string {
    return getRequiredModulesString(
        (requiredModules || []).filter((dep) => {
            return !MAIN_DEPS.includes(dep);
        })
    );
}

function getRequiredModulesString(requiredModules: string[] | undefined): string {
    if (!requiredModules || !requiredModules.length) {
        return '';
    }
    return `'${requiredModules.join("','")}'`;
}

export function getStaticDependenciesString(dependencies: string[]): string {
    return typeof dependencies === 'string'
        ? dependencies
        : dependencies
              .map((v) => {
                  return `'${v}'`;
              })
              .toString();
}
