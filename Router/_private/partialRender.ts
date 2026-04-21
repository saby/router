import { loadSync } from 'WasabyLoader/ModulesLoader';

interface IServerRoutingModule {
    enablePartialSend(): void;
    disablePartialSend(): void;
}

/**
 * Включить формирование и отправку на клиент части готовой html-разметки при потоковом построении страницы.
 * Метод ничего не делает на клиенте и при отключенном потоковом построении страницы.
 * @private
 */
export function enablePartialSend(): void {
    if (typeof window !== 'undefined') {
        return;
    }

    const serverRouting = loadSync<IServerRoutingModule>('Router/ServerRouting');
    return serverRouting.enablePartialSend();
}

/**
 * Отключить формирование и отправку на клиент части готовой html-разметки при потоковом построении страницы.
 * Метод ничего не делает на клиенте и при отключенном потоковом построении страницы.
 * @private
 */
export function disablePartialSend(): void {
    if (typeof window !== 'undefined') {
        return;
    }

    const serverRouting = loadSync<IServerRoutingModule>('Router/ServerRouting');
    return serverRouting.disablePartialSend();
}
