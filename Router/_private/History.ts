/// <amd-module name="Router/_private/History" />

/**
 * Набор методов для взаимодействия с Историей Роутера
 * @module
 * @name Router/_private/History
 * @author Санников К.А.
 */

import * as UrlRewriter from './UrlRewriter';
import * as Data from './Data';

/*
 * @function Router/_private/History#getPrevState
 * Get the previous history state (if it exists)
 * @returns {Data.IHistoryState}
 */
/**
 * Возвращает предыдущее состояние истории (если такое есть).
 * @function
 * @name Router/_private/History#getPrevState
 * @returns {Data/IHistoryState}
 */
export function getPrevState(): Data.IHistoryState {
    return Data.getHistory()[Data.getHistoryPosition() - 1];
}
/*
 * @function Router/_private/History#getCurrentState
 * Get the current history state
 * @returns {Data/IHistoryState}
 */
/**
 * Возвращает текущее состояние истории.
 * @function
 * @name Router/_private/History#getCurrentState
 * @returns {Data/IHistoryState}
 */
export function getCurrentState(): Data.IHistoryState {
    return Data.getHistory()[Data.getHistoryPosition()];
}
/*
 * @function Router/_private/History#getNextState
 * Get the next history state (if it exists)
 * @returns {Data/IHistoryState}
 */
/**
 * Возвращает следующее состояние истории (если такое есть).
 * @function
 * @name Router/_private/History#getNextState
 * @returns {Data/IHistoryState}
 */
export function getNextState(): Data.IHistoryState {
    return Data.getHistory()[Data.getHistoryPosition() + 1];
}

/*
 * @function Router/_private/History#back
 * Moves the Router one step back in history
 * @remark
 * This does not affect the window.history and the address bar location,
 * only the Router's history position.
 * Use native window.history.back method to go back in history while
 * changing the address bar location
 */
/**
 * @function Router/_private/History#back
 * Производит переход в истории на одно состояние назад
 * @remark
 * Этот метод не влияет на window.history и адресную строку браузера,
 * только внутреннее состояние роутинга.
 * Для совершения перехода назад и изменении как состояния роутера,
 * так и состояния истории и адресной строки браузера, используйте
 * нативный метод window.history.back
 */
export function back(newState: Data.IHistoryState): void {
    const history: Data.IHistoryState[] = Data.getHistory();
    const historyPosition: number = Data.getHistoryPosition();

    if (historyPosition === 0) {
        // If window has an existing state, use it instead of calculating by ourselves
        const windowHistoryState: {state: string} | undefined | null = typeof window !== 'undefined' && window.history.state;
        const currentState: string | undefined | null = windowHistoryState && windowHistoryState.state;
        const currentHref: string = Data.getVisibleRelativeUrl();
        history.unshift({
            id: history[0].id - 1,
            state: currentState || UrlRewriter.get(currentHref),
            href: currentHref
        });
    } else if (newState && newState.state) {
        let newPosition: number = historyPosition - 1;
        for (let i = 0; i < history.length; i++) {
            if (history[i].state === newState.state) {
                newPosition = i;
                break;
            }
        }
        Data.setHistoryPosition(newPosition);
    } else {
        Data.setHistoryPosition(historyPosition - 1);
    }

    _updateRelativeUrl();
}
/*
 * @function Router/_private/History#forward
 * Moves the Router one step forward in history
 * @remark
 * This does not affect the window.history and the address bar location,
 * only the Router's history position.
 * Use native window.history.forward method to go back in history while
 * changing the address bar location
 */
/**
 * @function Router/_private/History#forward
 * Производит переход в истории на одно состояние вперед
 * @remark
 * Этот метод не влияет на window.history и адресную строку браузера,
 * только внутреннее состояние роутинга.
 * Для совершения перехода назад и изменении как состояния роутера,
 * так и состояния истории и адресной строки браузера, используйте
 * нативный метод window.history.forward
 */
export function forward(newState: Data.IHistoryState): void {
    const history: Data.IHistoryState[] = Data.getHistory();
    let newHistoryPosition: number = Data.getHistoryPosition() + 1;

    if (newState && newState.state && newHistoryPosition < history.length) {
        for (let i = newHistoryPosition; i < history.length; i++) {
            if (history[i].state === newState.state) {
                newHistoryPosition = i;
                break;
            }
        }
    }

    Data.setHistoryPosition(newHistoryPosition);
    if (newHistoryPosition === history.length) {
        const currentUrl: string = Data.getRelativeUrl();
        history.push({
            id: history[newHistoryPosition - 1].id + 1,
            state: UrlRewriter.get(currentUrl),
            href: currentUrl
        });
    }

    _updateRelativeUrl();
}

/*
 * @function Router/_private/History#push
 * Moves the Router into a specified new state, pushes the changes
 * to the window.history
 * @param {Data/IHistoryState} newState new state to push
 * @remark
 * This function does not force the router components (like Route
 * and Reference) to update, it only pushes the state into window
 * and Router history. To change the state while updating Routes
 * and References, use Controller's **navigate** method instead
 * @see Router/_private/Controller#navigate
 */
/**
 * @function Router/_private/History#push
 * Переводит роутинг в новое состояние, записывая его в window.history
 * @param {Data/IHistoryState} newState состояние для добавления
 * @remark
 * Вызов этого метода не провоцирует обновление компонентов роутинга
 * (таких как Route и Reference), он только производит запись состояния
 * в историю окна и историю роутинга.
 * Для перехода в новое состояние с обновлением компонентов роутинга,
 * используйте метод **navigate** Controller'а.
 * @see Router/_private/Controller#navigate
 */
export function push(newState: Data.IHistoryState): void {
    const history: Data.IHistoryState[] = Data.getHistory();
    const historyPosition: number = Data.getHistoryPosition();

    // remove all states after the current state
    history.length = historyPosition + 1;

    // add new history state to the store
    newState.id = history[historyPosition].id + 1;
    history.push(newState);
    Data.setHistoryPosition(historyPosition + 1);

    // update the URL
    _updateRelativeUrl();
    const displayUrl: string = newState.href || newState.state;
    window.history.pushState(newState, displayUrl, displayUrl);
}

/*
 * @function Router/_private/History#replaceState
 * Replaces the current state in Router's history with the
 * specified state
 * @param {Data/IHistoryState} newState replacement state
 * This function does not start the Route and Reference update,
 * it only replaces the state in window and Router history.
 * To change the state while updating Routes and References,
 * use Controller's **replaceState** method instead
 * @see Router/_private/Controller#replaceState
 */
/**
 * @function Router/_private/History#replaceState
 * Заменяет текущее состоянии истории на переданное
 * @param {Data/IHistoryState} newState состояние для замены
 * Вызов этого метода не провоцирует обновление компонентов роутинга
 * (таких как Route и Reference), он только производит запись состояния
 * в историю окна и историю роутинга.
 * Для перехода в новое состояние с обновлением компонентов роутинга,
 * используйте метод **replaceState** Controller'а.
 * @see Router/_private/Controller#replaceState
 */
export function replaceState(newState: Data.IHistoryState): void {
    const history: Data.IHistoryState[] = Data.getHistory();
    const historyPosition: number = Data.getHistoryPosition();

    newState.id = history[historyPosition].id;

    history[historyPosition] = newState;

    _updateRelativeUrl();
    const displayUrl: string = newState.href || newState.state;
    window.history.replaceState(newState, displayUrl, displayUrl);
}

function _updateRelativeUrl(): void {
    Data.setRelativeUrl(Data.getHistory()[Data.getHistoryPosition()].state);
}
