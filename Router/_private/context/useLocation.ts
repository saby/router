import { useCallback, useSyncExternalStore } from 'react';
import type { ILocation } from 'Application/Env';
import type { IRouter } from '../Router/Router';
import { useRouter } from './useRouter';

/**
 * Снимок текущего адреса страницы.
 * @public
 */
export interface IRouterLocation {
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    href: string;
    pathname: string;
    search: string;
    hash: string;
}

/**
 * Мемоизированные снимки location на каждый Router.
 * Ключ — сам Router, поэтому в мапе не более одной записи на инстанс роутера
 * (не растёт с числом переходов); WeakMap не удерживает роутеры от сборки GC.
 */
const locationCache = new WeakMap<IRouter, { url: string; location: IRouterLocation }>();

function createLocation(location: ILocation): IRouterLocation {
    return {
        protocol: location.protocol,
        host: location.host,
        hostname: location.hostname,
        port: location.port,
        href: location.href,
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
    };
}

function getCachedLocation(router: IRouter): IRouterLocation {
    const url = router.url.getUrl();
    const cached = locationCache.get(router);
    if (cached && cached.url === url) {
        return cached.location;
    }
    const location = createLocation(router.url.location);
    locationCache.set(router, { url, location });
    return location;
}

/**
 * Хук для получения текущего location.
 * Источник данных — адресная строка ({@link Application/Env/ILocation}).
 * Возвращает неизменяемый снимок location; ссылка меняется при каждом реальном
 * изменении адреса (SPA-переходы, `replaceState`, переходы по истории, чисто
 * якорные переходы), поэтому объект безопасно указывать в deps
 * (`useMemo`/`useEffect`/`useCallback`).
 *
 * Программные {@link Router/router:IHistory#back back}/`forward` не меняют адресную
 * строку, поэтому значение хука при них не изменяется. Изменения адреса в обход
 * роутера хук не отслеживает.
 * @public
 */
export function useLocation(): IRouterLocation {
    const router = useRouter();
    const history = router.history;

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            // уведомляем подписчика только при реальной смене адреса
            let lastUrl = router.url.getUrl();
            const handleChange = () => {
                const url = router.url.getUrl();
                if (url === lastUrl) {
                    return;
                }
                lastUrl = url;
                onStoreChange();
            };
            const unsubscribe = history.subscribe(handleChange);
            if (typeof window !== 'undefined') {
                window.addEventListener('hashchange', handleChange);
            }
            return () => {
                unsubscribe();
                if (typeof window !== 'undefined') {
                    window.removeEventListener('hashchange', handleChange);
                }
            };
        },
        [router, history]
    );

    const getSnapshot = useCallback(() => getCachedLocation(router), [router]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
