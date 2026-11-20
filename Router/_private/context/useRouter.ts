import { useContext } from 'react';
import Context from './Context';
import { getRootRouter, IRouter } from '../Router/Router';

/**
 * Хук для получения Router из контекста.
 * Если Router не нашелся в контексте, то вернёт "корневой" Router.
 * @public
 */
export function useRouter(): IRouter {
    const Router = useRouterVoid();

    return Router || getRootRouter();
}

/**
 * Внутренний хук для получения Router из контекста.
 * @private
 */
export function useRouterVoid(): IRouter | undefined {
    return useContext(Context);
}
