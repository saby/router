interface IGlobalThis extends Window {
    startScript: Function;
    readyToStartScript: boolean;
}

/**
 * Признак, что ещё не готовы к старту.
 * Будем готовы к старту только когда все скрипты будут загружены и проинициализированы в require и
 * при наступлении события DOMContentLoaded
 */
export const readyToStartScript = `
window.readyToStartScript = false;
`;

/**
 * Функция вызыватор старта приложения.
 * Она должна быть вставлена в тело страницы и её необходимо вызывать строго после того,
 * как все скрипты будут загружены и проинициализированы в require.
 */
export function callStartScript() {
    const globalEnv: IGlobalThis = globalThis as unknown as IGlobalThis;
    globalEnv.readyToStartScript = true;
    if (globalEnv.startScript) {
        globalEnv.startScript();
    }
}

export const registerStartScriptEvent = `
document.addEventListener('DOMContentLoaded', function () {
    if (window.readyToStartScript === false) {
        return;
    }
    if (window.startScript) {
        window.startScript();
    }
});
`;
