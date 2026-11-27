import { getStore, IHttpResponse, logger, query, App } from 'Application/Env';
import { getPageRenderer, logPartialSend, isLoggingPartialSend } from 'Router/Builder';

interface IRouterResponseWrapper {
    /**
     * Получить режим построения, выбранный при инициализации
     */
    get isPartialRender(): boolean;
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
 * Проверить, разрешена ли частичная отдача html для текущего ответа
 * @hidden
 */
function isPartialRenderAllowed(res: IHttpResponse): boolean {
    // можно отключить частичное формирование html-разметки установкой query параметра disablePartialRender=true
    return query.get.disablePartialRender !== 'true' && !!res.stream_response;
}

/**
 * Инициализация класса, который будет управлять способом построения
 * Создает только состояние ответа, PageRenderer инициализируется отдельно
 * @hidden
 */
export function initResponseWrapper(res: IHttpResponse, allowPartialRender: boolean = true): void {
    const store = getStore<Record<string, IRouterResponseWrapper>>('IRouterResponse');

    // состояние ответа в рамках запроса инициализируется один раз
    if (store.get('instance')) {
        return;
    }

    const partialRender = allowPartialRender && isPartialRenderAllowed(res);

    logPartialSend(
        'initResponseWrapper',
        'Инициализация ResponseWrapper: ' +
            (partialRender ? 'потоковый Response' : 'обычный Response')
    );

    store.set(
        'instance',
        partialRender ? new StreamResponseWrapper(res) : new ResponseWrapper(res)
    );
}

/**
 * Получить режим построения, выбранный при инициализации ResponseWrapper
 * @hidden
 */
export function getPartialRenderMode(): boolean {
    if (!App.getRequest()) {
        return false;
    }

    const store = getStore<Record<string, IRouterResponseWrapper>>('IRouterResponse');
    const instance = store.get('instance');

    if (!instance) {
        logPartialSend('getPartialRenderMode', 'ResponseWrapper не инициализирован');
        return false;
    }

    return instance.isPartialRender;
}

function getResponseWrapper(): IRouterResponseWrapper | null {
    if (!App.getRequest()) {
        // сейчас только одно такое место - на СП до инициализации Request могут вызвать sendStatus
        // а там есть проверка, что была ли отправлена часть html и в итоге будет обращение к appRequest
        return null;
    }
    const store = getStore<Record<string, IRouterResponseWrapper>>('IRouterResponse');
    const instance = store.get('instance');
    if (!instance) {
        logger.warn(
            'Попытка использовать класс потокового построения без инициализации.',
            new Error().stack
        );
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

    get isPartialRender(): boolean {
        return false;
    }

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

    get isPartialRender(): boolean {
        // режим выбран при инициализации и не зависит от disableSend/enableSend
        return true;
    }

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
        if (isLoggingPartialSend()) {
            this.res.send(html + '\n<!-- partial html end -->\n');
            return;
        }
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
