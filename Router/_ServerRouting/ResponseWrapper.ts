import { getStore, IHttpResponse, logger, query } from 'Application/Env';
import type { IRenderOptions } from 'Router/Builder';
import { getPageRenderer, initPageRenderer, logPartialSend } from 'Router/Builder';

interface IRouterResponseWrapper {
    /**
     * Получить признак, что потоковеое построение выключено
     */
    get partialSendDisabled(): boolean;
    /**
     * Узнать, что при потоковом построении уже что-то было отправлено на клиент
     */
    get isPartialHtmlSent(): boolean;
    send(html: string): void;
    disableSend(): void;
    enableSend(): void;
}

/**
 * Инициализация класса, который будет управлять способом построения построения
 * @hidden
 */
export function initResponseWrapper(res: IHttpResponse, options: IRenderOptions) {
    const store = getStore<Record<string, IRouterResponseWrapper>>('IRouterResponse');
    let instance = store.get('instance');
    if (instance) {
        throw new Error('Попытка повторной инициализации класса потокового построения.');
    }

    // можно отключить частичное формирование html-разметки установкой query параметра disablePartialRender=true
    const streamResponse =
        query.get.disablePartialRender === 'true' ? false : !!res.stream_response;

    logPartialSend(
        'initResponseWrapper',
        'Инициализация ResponseWrapper: ' +
            (streamResponse ? 'потоковоый Response' : 'обычный Response')
    );

    instance = streamResponse ? new StreamResponseWrapper(res) : new ResponseWrapper(res);
    store.set('instance', instance);

    initPageRenderer(streamResponse, options);
}

function getResponseWrapper(): IRouterResponseWrapper | null {
    const store = getStore<Record<string, IRouterResponseWrapper>>('IRouterResponse');
    const instance = store.get('instance');
    if (!instance) {
        logger.warn('Попытка использовать класс потокового построения без инициализации.');
    }
    return instance;
}

/**
 * @private
 */
export function sendPartialHtml(): void {
    const res = getResponseWrapper();
    if (!res) {
        return;
    }
    if (res.partialSendDisabled) {
        logPartialSend('sendPartialHtml', 'Потоковое построение выключено');
        return;
    }
    res.disableSend();

    const renderAndSend = () => {
        logPartialSend('sendPartialHtml', 'Начало подготовки html');
        const html = getPageRenderer().renderPartial();
        logPartialSend('sendPartialHtml', 'Размер готового html: ' + (html ? html.length : 0));
        res.enableSend();
        res.send(html);
    };

    if (isAsyncRenderAndSendDisabled()) {
        logPartialSend('sendPartialHtml', 'Синхронный renderAndSend');
        renderAndSend();
        return;
    }

    // закидываем вычисление зависимостей, построение html и отправку в другой Task.
    // это попытка не блокировать запуск БЛ вызовов, который мог запуститься в текущем Task.
    setTimeout(() => {
        logPartialSend('sendPartialHtml', 'Асинхронный renderAndSend');
        renderAndSend();
    }, 0);
}

/**
 * @private
 */
export function disablePartialSend(): void {
    const res = getResponseWrapper();
    if (!res) {
        return;
    }
    res.disableSend();
}

/**
 * @private
 */
export function enablePartialSend(): void {
    const res = getResponseWrapper();
    if (!res) {
        return;
    }
    res.enableSend();
}

function isAsyncRenderAndSendDisabled(): boolean {
    const store = getStore<Record<string, boolean>>('AsyncRenderAndSend');
    return !!store.get('disabled');
}

/**
 * Отключение асинхронного (оборачивание в setTimeout) формирования html и его отправки.
 * В процессе загрузки данных (getDataTorender) необходимо render и send делать в setTimeout
 * @private
 */
export function disableAsyncRenderAndSend(): void {
    const store = getStore<Record<string, boolean>>('AsyncRenderAndSend');
    store.set('disabled', true);
}

/**
 * Проверить, была ли уже отправка части HTML
 * @private
 */
export function isPartialHtmlSent(): boolean {
    const res = getResponseWrapper();
    if (!res) {
        return false;
    }
    return res.isPartialHtmlSent;
}

/**
 * Класс, который отвечает за построение html-разметки в обычном режиме построения.
 * Не делает ничего.
 */
class ResponseWrapper implements IRouterResponseWrapper {
    constructor(_: IHttpResponse) {}

    get partialSendDisabled(): boolean {
        return true;
    }

    get isPartialHtmlSent(): boolean {
        return false;
    }

    send(_: string) {
        // do nothing
    }

    disableSend(): void {
        // do nothing
    }

    enableSend(): void {
        // do nothing
    }
}

/**
 * Класс, который отвечает за построение html-разметки в потоковом режиме построения.
 */
class StreamResponseWrapper implements IRouterResponseWrapper {
    private _partialSendDisabled: boolean = false;
    private _isPartialHtmlSent: boolean = false;

    constructor(private res: IHttpResponse) {}

    get partialSendDisabled(): boolean {
        return this._partialSendDisabled;
    }

    get isPartialHtmlSent(): boolean {
        return this._isPartialHtmlSent;
    }

    send(html: string) {
        if (this.partialSendDisabled) {
            logPartialSend('StreamResponse.send', 'Потоковое построение выключено');
            return;
        }
        if (!html) {
            logPartialSend('StreamResponse.send', 'Пустой html');
            return;
        }
        this._isPartialHtmlSent = true;
        logPartialSend('StreamResponse.send', 'Порция html отправлена');
        this.res.send(html);
    }

    disableSend() {
        logPartialSend('StreamResponse', 'Выключили потоковое построение');
        this._partialSendDisabled = true;
    }

    enableSend() {
        logPartialSend('StreamResponse', 'Включили потоковое построение');
        this._partialSendDisabled = false;
    }
}
