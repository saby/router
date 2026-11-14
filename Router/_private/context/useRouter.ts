import { useContext } from 'react';
import Context from './Context';
import { getRootRouter, IRouter } from '../Router/Router';
import { getWasabyContext } from 'UICore/Contexts';

/**
 * Хук для получения Router из контекста.
 * Если Router не нашелся в контексте или нет контекста, то вернёт "корневой" Router.
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
    const Router = useContext(Context);
    const context = useContext(getWasabyContext());

    // если есть Router в WasabyContext и
    // - сверху нет RouterContext
    // - или в WasabyContext "вложенный" виртуальный Router (какой-то старый код)
    // тогда вернём Router из WasabyContext
    if (context.Router && (!Router || context.Router.instId > Router.instId)) {
        return context.Router;
    }

    return Router;
}
