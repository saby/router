import { useContext, forwardRef, Ref } from 'react';
import { getWasabyContext } from 'UI/Contexts';
import RouterContext from './Context';
import ContextProvider from './ContextProvider';
import type { Route, IRouteProps } from '../Route';
import type { Reference, IReferenceProps } from '../Reference';

/**
 * Эти функции нужны только в переходный момент, пока Router полностью не переехал в свой контекст.
 * TODO https://online.sbis.ru/opendoc.html?guid=7d1f9ce2-b86a-48b9-9ac1-13b33dd761f9&client=3
 */

export interface IRouteWrapperProps extends IRouteProps {
    /**
     * Временное поле для того, чтобы работал костыль в Page/base:Controller
     * TODO https://online.sbis.ru/opendoc.html?guid=ce230785-636a-47c3-9a9c-96460a7138d9&client=3
     */
    instanceRef?: Ref<Route>;
}

/**
 * Обертка над Route для того, чтобы для него всегда Router был в контексте router.Context
 * Для Route входящий ref прокидываем как ref, т.к. минимум в Page/base:Controller ему ставят ref
 * и ожидают ссылку на контрол
 */
export function wrapRouteToContext(WrappedComponent: typeof Route) {
    const Wrapper = forwardRef(function Wrapper(
        props: IRouteWrapperProps,
        ref: Ref<HTMLElement>
    ): JSX.Element {
        const Router = useContext(RouterContext);
        const context = useContext(getWasabyContext());

        if (context.Router && (!Router || context.Router.instId > Router.instId)) {
            return (
                <ContextProvider Router={context.Router}>
                    <WrappedComponent {...props} forwardedRef={ref} ref={props.instanceRef} />
                </ContextProvider>
            );
        }
        return <WrappedComponent {...props} forwardedRef={ref} ref={props.instanceRef} />;
    });

    Wrapper.displayName = `wrapToContext(${WrappedComponent.displayName})`;

    return Wrapper;
}

/**
 * Обертка над Reference для того, чтобы для него всегда Router был в контексте router.Context
 * Приходится входящий ref прокидывать как forwardedRef, т.к. есть места, где Reference ставят в корень Wasaby контрола
 * и у него ломаются события, т.к. не устанавливается _container
 */
export function wrapReferenceToContext(WrappedComponent: typeof Reference) {
    const Wrapper = forwardRef(function Wrapper(
        props: IReferenceProps,
        ref: Ref<HTMLElement>
    ): JSX.Element {
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
