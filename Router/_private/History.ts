/// <amd-module name="Router/_private/History" />

/**
 * Набор методов для взаимодействия с Историей Роутера
 * @module
 * @author Санников К.А.
 * @public
 */

import * as UrlRewriter from './UrlRewriter';
import * as Data from './Data';

/*
 * Get the previous history state (if it exists)
 * @function
 * @returns {Router/_private/Data/IHistoryState}
 */
/**
 * Возвращает предыдущее состояние истории (если такое есть).
 * @function
 * @returns {Router/_private/Data/IHistoryState}
 */
export function getPrevState(): Data.IHistoryState {
    return Data.getHistory()[Data.getHistoryPosition() - 1];
}

/*
 * Get the current history state
 * @function
 * @returns {Router/_private/Data/IHistoryState}
 */
/**
 * Возвращает текущее состояние истории.
 * @function
 * @returns {Router/_private/Data/IHistoryState}
 */
export function getCurrentState(): Data.IHistoryState {
    return Data.getHistory()[Data.getHistoryPosition()];
}

/*
 * Get the next history state (if it exists)
 * @function
 * @returns {Router/_private/Data/IHistoryState}
 */
/**
 * Возвращает следующее состояние истории (если такое есть).
 * @function
 * @returns {Router/_private/Data/IHistoryState}
 */
export function getNextState(): Data.IHistoryState {
    return Data.getHistory()[Data.getHistoryPosition() + 1];
}

/*
 * Moves the Router one step back in history (previous or given)
 * @function
 * @param {Router/_private/Data/IHistoryState} newState new state - when there is a transition back not to the previous
 * state, but the state earlier than the previous one
 * @remark
 * This does not affect the window.history and the address bar location,
 * only the Router's history position.
 * Use native window.history.back method to go back in history while
 * changing the address bar location
 */
/**
 * Производит переход в истории на одно состояние (предыдущее или заданное) назад
 * @function
 * @param {Router/_private/Data/IHistoryState} newState новое состояние - когда происходит переход назад не на
 * предыдущее состояние, а состояние ранее предыдущего
 * @remark
 * Этот метод не влияет на window.history и адресную строку браузера,
 * только внутреннее состояние роутинга.
 * Для совершения перехода назад и изменении как состояния роутера,
 * так и состояния истории и адресной строки браузера, используйте
 * нативный метод window.history.back
 */
export function back(newState?: Data.IHistoryState): void {
    const history: Data.IHistoryState[] = Data.getHistory();
    const historyPosition: number = Data.getHistoryPosition();

    if (historyPosition === 0) {
        const newHistoryState: Data.IHistoryState = _calculateNewHistoryState(newState);
        history.unshift({
            id: history[0].id - 1,
            state: newHistoryState.state,
            href: newHistoryState.href
        });
    } else if (newState && newState.state) {
        // при переходе назад на несколько состояний (стрелкой в браузере)
        // необходимо пересчитать новую позицию истории роутинга
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
 * Moves the Router one step forward (next or given) in history
 * @function
 * @param {Router/_private/Data/IHistoryState} newState new state - when the transition occurs not to the next state,
 * but the state through the next forward
 * @remark
 * This does not affect the window.history and the address bar location,
 * only the Router's history position.
 * Use native window.history.forward method to go forward in history while
 * changing the address bar location
 */
/**
 * Производит переход в истории на одно (следующее или заданное) состояние вперед
 * @function
 * @param {Router/_private/Data/IHistoryState} newState новое состояние - когда происходит переход не на следующее
 * состояние, а состояние через следующее вперед
 * @remark
 * Этот метод не влияет на window.history и адресную строку браузера, только внутреннее состояние роутинга.
 * Для совершения перехода вперед и изменения как состояния роутера, так и состояния истории и адресной строки браузера,
 * используйте нативный метод window.history.forward
 */
export function forward(newState?: Data.IHistoryState): void {
    const history: Data.IHistoryState[] = Data.getHistory();
    let newHistoryPosition: number = Data.getHistoryPosition() + 1;

    // при переходе вперед на несколько состояний (стрелкой в браузере)
    // необходимо пересчитать новую позицию истории роутинга
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
        const newHistoryState: Data.IHistoryState = _calculateNewHistoryState(newState);
        history.push({
            id: history[newHistoryPosition - 1].id + 1,
            state: newHistoryState.state,
            href: newHistoryState.href
        });
    }

    _updateRelativeUrl();
}

/**
 * Вычислим правильные state и href для нового состояния истории переходов
 * Либо его передали при переходе (по стрелке в браузере), либо возьмем его из window.history
 * Если в итоге не найдем, то потом оно будет вычислено из URL-адреса, которое сейчас отображается в адресной строке
 * @param newState
 */
function _calculateNewHistoryState(newState: Data.IHistoryState): Data.IHistoryState {
    if (newState && newState.state) {
        return {
            state: UrlRewriter.get(newState.state),
            href: newState.href || UrlRewriter.getReverse(newState.state)
        };
    }

    // Если в window.history уже есть state, то используем его, вместо того, чтобы вычислять
    const windowHistoryState: { state: string } | undefined | null = window?.history?.state;
    const currentState: string | undefined | null = windowHistoryState && windowHistoryState.state;
    const currentHref: string = Data.getVisibleRelativeUrl();
    return {
        state: currentState || UrlRewriter.get(currentHref),
        href: currentHref
    };
}

/*
 * Moves the Router into a specified new state, pushes the changes
 * to the window.history
 * @function
 * @param {Router/_private/Data/IHistoryState} newState new state to push
 * @remark
 * This function does not force the router components (like Route
 * and Reference) to update, it only pushes the state into window
 * and Router history. To change the state while updating Routes
 * and References, use Controller's **navigate** method instead
 * @see Router/_private/Controller#navigate
 */
/**
 * Переводит роутинг в новое состояние, записывая его в window.history
 * @function
 * @param {Router/_private/Data/IHistoryState} newState состояние для добавления
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
 * Replaces the current state in Router's history with the
 * specified state
 * @function
 * @param {Router/_private/Data/IHistoryState} newState replacement state
 * This function does not start the Route and Reference update,
 * it only replaces the state in window and Router history.
 * To change the state while updating Routes and References,
 * use Controller's **replaceState** method instead
 * @see Router/_private/Controller#replaceState
 */
/**
 * Заменяет текущее состоянии истории на переданное
 * @function
 * @param {Router/_private/Data/IHistoryState} newState состояние для замены
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
    const currentState: Data.IHistoryState = history[historyPosition];

    newState.id = currentState.id;
    newState.href = newState.href || UrlRewriter.getReverse(newState.state);

    history[historyPosition] = newState;

    _updateRelativeUrl();
    window.history.replaceState(newState, newState.href, newState.href);
}

function _updateRelativeUrl(): void {
    Data.setRelativeUrl(Data.getHistory()[Data.getHistoryPosition()].state);
}
