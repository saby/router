import { useContext, ComponentType, forwardRef, Ref } from 'react';
import { getWasabyContext } from 'UI/Contexts';
import RouterContext from './Context';
import ContextProvider from './ContextProvider';

/**
 * Обертка над Reference|Route для того, чтобы для них всегда Router был из контекста
 */
export function wrapToContext<I = {}>(WrappedComponent: ComponentType<I>) {
    const Wrapper = forwardRef(function Wrapper(props: I, ref: Ref<HTMLElement>): JSX.Element {
        const Router = useContext(RouterContext);
        const context = useContext(getWasabyContext());

        if (context.Router && (!Router || context.Router.instId > Router.instId)) {
            return (
                <ContextProvider Router={context.Router}>
                    <WrappedComponent {...props} forwardedRef={ref} />
                </ContextProvider>
            );
        }
        return <WrappedComponent {...props} forwardedRef={ref} />;
    });

    Wrapper.displayName = `wrapToContext(${WrappedComponent.displayName})`;

    return Wrapper;
}
