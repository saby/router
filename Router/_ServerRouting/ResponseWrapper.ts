import { getStore, IHttpResponse, logger, query } from 'Application/Env';
import { IRenderOptions } from 'Router/Builder';
import { getPageRenderer, initPageRenderer } from 'Router/Builder';

interface IRouterResponseWrapper {
    get partialSendDisabled(): boolean;
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

    // можно отключить частичное формирование html-разметки установкой куки disablePartialRender=true
    const streamResponse =
        query.get.disablePartialRender === 'true' ? false : !!res.stream_response;

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
        return;
    }
    res.disableSend();
    const html = getPageRenderer().renderPartial();
    res.enableSend();
    res.send(html);
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
 * Класс, который отвечает за построение html-разметки в обычном режиме построения.
 * Не делает ничего.
 */
class ResponseWrapper implements IRouterResponseWrapper {
    constructor(_: IHttpResponse) {}

    get partialSendDisabled(): boolean {
        return true;
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

    constructor(private res: IHttpResponse) {}

    get partialSendDisabled(): boolean {
        return this._partialSendDisabled;
    }

    send(html: string) {
        if (this.partialSendDisabled) {
            return;
        }
        if (!html) {
            return;
        }
        this.res.send(html);
    }

    disableSend() {
        this._partialSendDisabled = true;
    }

    enableSend() {
        this._partialSendDisabled = false;
    }
}
