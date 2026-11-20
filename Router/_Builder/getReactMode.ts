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

    const isDebugMode = isTestStandEnv();
    const disableDebugModeForPerformanceCalc =
        cookie.get('disableDebugModeForPerformanceCalc') === 'true';

    reactMode = 'default';
    if (disableDebugModeForPerformanceCalc) {
        reactMode = 'release';
    } else if (isDebugMode) {
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
        !((cookie.get('disableDebugModeForPerformanceCalc') as string) === 'true') &&
        // @todo вернуть условия https://online.saby.ru/opendoc.html?guid=01a0aef1-c02c-7e00-a98e-edde7b2f3a5f&client=3
        // location.host.indexOf('DemoStand') !== -1 ||
        // location.host.indexOf('autotest') !== -1 ||
        // location.host.indexOf('prognix') !== -1 ||
        (location.host.indexOf('dev-online') !== -1 || location.host.indexOf('test-online') !== -1);
    return isDebugMode;
}
