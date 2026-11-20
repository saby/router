import { useMemo, forwardRef, cloneElement } from 'react';
import type { Ref, ReactElement, ReactNode } from 'react';
import { getRootRouter, IRouter } from '../Router/Router';
import Context from './Context';

/**
 * Интерфейс опций провайдера для контекста {@link Router/router:Context}
 * @public
 */
export interface IContextProps {
    /**
     * Объект реализующий интерфейс API работы с роутингом
     */
    Router: IRouter;
    children: ReactNode;
}

/**
 * Провайдер для контекста {@link Router/router:Context}
 * @public
 */
const ContextProvider = forwardRef(function ContextProvider(
    props: IContextProps,
    ref: Ref<HTMLElement>
) {
    const router = useMemo<IRouter>(() => {
        return props.Router || getRootRouter(true);
    }, [props.Router]);

    const children = !ref ? props.children : cloneElement(props.children as ReactElement, { ref });

    return <Context.Provider value={router}>{children}</Context.Provider>;
});

ContextProvider.displayName = 'Router/router:ContextProvider';
export default ContextProvider;
