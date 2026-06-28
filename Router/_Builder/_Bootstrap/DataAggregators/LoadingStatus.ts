import { Head as AppHead } from 'Application/Page';
import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';
import { cookie } from 'Env/Env';
import { prepareScript } from '../html/prepareScript';

export const storageKey = 'theForceReloadWasEarly';

/**
 * Бездумное обновление страницы в случае ошибки приводит к шквалу запросов на сервер.
 * Например, наступает момент нагрузки. Падает cdn. На страницу не прилетают супербандлы и все
 * Лавина пикообразно возрастает в несколько раз.
 * Поэтому было принято решение помечать страницу как принудительно перезагруженная и не обновлять ее в дальнейшем.
 * Потом 1 раз за одну загрузку страницы покажем нативный диалог с сообщением о проблемах
 * и предложением перезагрузить страницу.
 *
 * А как же снять флаг? Флаг снимается в стартовом скрипте.
 *
 * "Сломанный" файл помечаем - из пути типа resources/filename.min.js?x_module=12345678 получаем имя файла filename.min
 *
 * Если файл вставлен не нами (нет data-rid), то просто запоминаем проблемный файл, но не делаем перезагрузку
 */
const onErrorHandler = prepareScript(`
    function onErrorHandler(e) {
        if (!e.target || !e.target.tagName || e.target.tagName !== 'SCRIPT' || !e.target.src) {
            return;
        }
        var name = e.target.src;
        window.wsConfig.loadingStatus = window.wsConfig.loadingStatus || {};
        window.wsConfig.loadingStatus[name] = 'ERROR';
        var rid = e.target.dataset.rid;
        if (!rid) {
            return;
        }
        try {
            if (window.sessionStorage.getItem('${storageKey}')) {
                window.wsConfig.loadingStatus.${storageKey} = true;
                if (!window.wsConfig.loadingStatus.dialogShown) {
                    setTimeout(function () {
                        var res = window.confirm('При загрузке страницы не все ресурсы были загружены.'
                            +' Страница может работать некорректно. Перезагрузить страницу?');
                        if (res) {
                            window.location.reload();
                        }
                    }, 100);
                    window.wsConfig.loadingStatus.dialogShown = true;
                }
                return;
            }
            window.sessionStorage.setItem('${storageKey}', 'true');
            window.location.reload();
        } catch(err) { /* sessionStorage недоступен */}
        return true; /* Останавливаем всплытие */
    };
window.addEventListener('error', onErrorHandler, true);
`);

/**
 * Класс, который обеспечивает наличие на тегах script, указывающих на важные ресурсы,
 * обработчиков успешной и безуспешной загрузки.
 * *
 * Была зарегистрирована ошибка в логах, в которой у нас НЕ ЗАГРУЗИЛСЯ
 * RequireJsLoader/config и супурбандл(ы).
 * Причина возникновения неполадки неясна, но было принято решение перезагружать страницу.
 * https://online.sbis.ru/opendoc.html?guid=019e236c-b1c0-4d2a-b4ad-577cbdd0a612
 * *
 * Другой кейс - получать в логах информация о состоянии этих ресурсов в момент возникновения ошибки
 * @private
 */
export class LoadingStatus implements IDataAggregatorModule {
    execute(): Partial<IFullData> | null {
        if (LoadingStatus._isDebug()) {
            return null;
        }

        AppHead.getInstance().createMergeTag('script', {}, onErrorHandler);

        return null;
    }

    private static _isDebug(): boolean {
        const s3debugCookie = cookie.get('s3debug');
        const isWasabyCLICookie = cookie.get('IsWasabyCLI');
        const isDebug = s3debugCookie !== 'false' && !!s3debugCookie;
        const isWasabyCLI = isWasabyCLICookie !== 'false' && !!isWasabyCLICookie;

        return isDebug || isWasabyCLI;
    }

    /** Удалить подписку на событие window.onerror после загрузки всех статичных JS зависимостей страницы */
    static getRemoveEventListener(): string {
        if (LoadingStatus._isDebug()) {
            return '';
        }

        return "window.removeEventListener('error', onErrorHandler, true);";
    }
}
