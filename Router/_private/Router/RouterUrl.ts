import { getConfig, ILocation } from 'Application/Env';
import UrlRewriter from '../UrlRewriter';

/**
 * Интерфейс класса работы с url в рамках Роутинга.
 * @public
 * @author Мустафин Л.И.
 */
export interface IRouterUrl {
    /**
     * window.location или его реализация в случае открытия приложения на панели.
     */
    readonly location: ILocation;
    /**
     * Возвращает url внутреннего состояния Роутера.
     */
    getStateUrl(): string;
    /**
     * Установка нового актуального значения url'а внутреннего состояния Роутера.
     * @hidden
     */
    setStateUrl(value: string): void;
    /**
     * Возвращает url из адресной строки.
     */
    getUrl(): string;
    /**
     * Получить url с префиксом сервиса вначале.
     * Актуален на СП, т.к. для стороннего сервиса на СП поле appRoot === '/', тогда как на клиенте appRoot = '/external'
     * напр. находимся на странице /page/some стороннего сервиса /external
     * Тогда этот метод на СП вернет строчку /external/page/some
     * Когда метод getStateUrl на СП вернет строчку вида /page/some
     */
    getServiceUrl(url?: string): string;
    /**
     * Получить "логический url".
     * "Логический url" - это часть url без названия сервиса (может быть в начале url на клиенте)
     * и без алиаса приложения (может быть в начале url после названия сервиса).
     * @hidden
     */
    getLogicUrl(): string;
    /**
     * Получить url с префиксом сервиса и алиаса вначале.
     * Не зависимо от окружения вызова (СП или клиент) добавит в начало url название сервиса и/или алиас приложения
     * если они есть.
     * @hidden
     */
    getRealUrl(href?: string): string;
}

/**
 * Класс для работы с url в рамках Роутинга.
 * @private
 * @author Мустафин Л.И.
 */
export default class RouterUrl implements IRouterUrl {
    /**
     * Url внутреннего состояния Роутера
     */
    private _stateUrl: string;

    constructor(
        public location: ILocation,
        urlRewriter: UrlRewriter
    ) {
        this._stateUrl = urlRewriter.get(this.getLogicUrl());
    }

    /**
     * Возвращает url внутреннего состояния Роутера.
     */
    getStateUrl(): string {
        return this._stateUrl || this.getLogicUrl();
    }

    /**
     * Установка нового актуального значения url'а внутреннего состояния Роутера.
     */
    setStateUrl(value: string): void {
        this._stateUrl = value;
    }

    /**
     * Возвращает url из адресной строки.
     */
    getUrl(): string {
        return this.location.pathname + this.location.search + this.location.hash;
    }

    /**
     * Получить url с префиксом сервиса вначале.
     * Актуален на СП, т.к. для стороннего сервиса на СП поле appRoot === '/', тогда как на клиенте appRoot = '/external'
     * напр. находимся на странице /page/some стороннего сервиса /external
     * Тогда этот метод на СП вернет строчку /external/page/some
     * Когда метод getStateUrl на СП вернет строчку вида /page/some
     * @deprecated getRealUrl
     */
    getServiceUrl(url?: string): string {
        const href = url || this.getUrl();
        let appRoot: string = getConfig('appRoot');

        // если не задан appRoot или это "основной" сервис
        if (!appRoot || appRoot === '/') {
            return href;
        }

        appRoot = appRoot.replace(/\//g, '');
        const hrefParts = href.replace(/^\//, '').split('/');

        // если в начале url НЕТ "названия" сервиса
        // то нужно добавить его в начало url
        if (hrefParts[0] !== appRoot) {
            hrefParts.unshift(appRoot);
        }

        return '/' + hrefParts.join('/');
    }

    /**
     * Получить "логический url".
     * "Логический url" - это часть url без названия сервиса (может быть в начале url на клиенте)
     * и без алиаса приложения (может быть в начале url после названия сервиса).
     */
    getLogicUrl(): string {
        let url = this.getUrl();

        // удаление названия сервиса из начала url. только на клиенте, т.к. на СП и так в url нет названия сервиса
        const appRoot: string = getConfig('appRoot');
        if (appRoot && appRoot !== '/') {
            const _appRoot = appRoot.replace(/\//g, '');

            const appRootRegExp = new RegExp(`^/${_appRoot}`);
            url = url.replace(appRootRegExp, '');
        }

        const appAlias: string = getConfig('appAlias');
        if (!appAlias) {
            return url;
        }

        // удалить алиас из начала url
        const aliasRegExp = new RegExp(`^/${appAlias}`);
        return url.replace(aliasRegExp, '');
    }

    /**
     * Получить url с префиксом сервиса и алиаса вначале.
     * Не зависимо от окружения вызова (СП или клиент) добавит в начало url название сервиса и/или алиас приложения
     * если они есть.
     */
    getRealUrl(href?: string): string {
        let _href = href;

        if (_href) {
            // если href указан, тогда сначала нужно добавить алиас приложения
            const appAlias: string = getConfig('appAlias');
            if (appAlias) {
                _href = '/' + appAlias + (_href.startsWith('/') ? _href : '/' + _href);
            }
        } else {
            // если href НЕ указан, тогда просто возьмём текущий url
            _href = this.getUrl();
        }

        // нужно добавить название сервиса в начало
        return this.getServiceUrl(_href);
    }
}
