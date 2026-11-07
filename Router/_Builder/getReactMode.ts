import { TReactMode } from 'RequireJsLoader/getResourcesList';
import { cookie, getStore, location } from 'Application/Env';

/**
 * Получить признак того, какие исходники react необходимо включить в тело страницы при построении на СП
 */
export default function getReactMode(): TReactMode {
    const store = getStore<Record<string, TReactMode>>('reactModeStore');
    let reactMode = store.get('value');
    if (reactMode) {
        return reactMode;
    }

    const disableDebugModeForPerformanceCalc =
        cookie.get('disableDebugModeForPerformanceCalc') === 'true';

    reactMode = 'default';
    if (disableDebugModeForPerformanceCalc) {
        reactMode = 'release';
    } else if (isTestStandEnv()) {
        reactMode = 'debug';
    }

    store.set('value', reactMode);
    return reactMode;
}

/**
 * Проверим, что строимся в окружении тестового стенда
 * @returns
 */
function isTestStandEnv(): boolean {
    const isDebugMode =
        typeof window === 'undefined' &&
        // как включить на автотестах не понятно там больше 4000 тестов с ошибками реакта падает
        // location.host.indexOf('autotest') !== -1 ||
        // location.host.indexOf('prognix') !== -1 ||
        (location.host.indexOf('dev-online') !== -1 || location.host.indexOf('test-online') !== -1);
    return isDebugMode;
}
