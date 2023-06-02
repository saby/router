import { getConfig, ILocation } from 'Application/Env';
import UrlRewriter from '../UrlRewriter';

/**
 * Интерфейс класса работы с url в рамках Роутинга.
 * @interface Router/_private/IRouterUrl
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
     * Получить url внутреннего состояния Роутера, с префиксом сервиса вначале. Актуален преимущественно на СП.
     * напр. находимся на странице /page/some стороннего сервиса /external
     * Тогда этот метод на СП вернет строчку /external/page/some
     * Когда метод getStateUrl на СП вернет строчку вида /page/some
     */
    getStateUrlWithService(url?: string): string;
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

    constructor(public location: ILocation, urlRewriter: UrlRewriter) {
        this._stateUrl = urlRewriter.get(this.getUrl());
    }

    /**
     * Возвращает url внутреннего состояния Роутера.
     */
    getStateUrl(): string {
        return this._stateUrl || this.getUrl();
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
        return (
            this.location.pathname + this.location.search + this.location.hash
        );
    }

    /**
     * Получить url внутреннего состояния Роутера, с префиксом сервиса вначале. Актуален преимущественно на СП.
     * напр. находимся на странице /page/some стороннего сервиса /external
     * Тогда этот метод на СП вернет строчку /external/page/some
     * Когда метод getStateUrl на СП вернет строчку вида /page/some
     */
    getStateUrlWithService(url?: string): string {
        let href: string = url || this.getStateUrl();
        let appRoot: string = getConfig('appRoot');
        if (appRoot && appRoot !== '/') {
            if (href.startsWith('/')) {
                href = href.substr(1);
            }
            if (!appRoot.endsWith('/')) {
                appRoot += '/';
            }
            return appRoot + href;
        }
        return href;
    }
}
