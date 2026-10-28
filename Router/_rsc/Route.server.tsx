import { FunctionComponent, Ref } from 'react';
import { getRootRouter, getUrlOptionsFromProps, IRouteProps } from 'Router/router';

/**
 * Опции компонента Route.server
 * @public
 */
interface IServerRouteProps extends Pick<IRouteProps, 'mask' | 'forwardedRef'> {
    renderChild: FunctionComponent<{
        forwardedRef?: Ref<HTMLElement>;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
}

/**
 * RSC-реализация компонента Router/router:Route
 */
export function Route(props: IServerRouteProps) {
    const Router = getRootRouter();
    let urlOptions = Router.maskResolver.calculateUrlParams(props.mask);
    urlOptions = { ...urlOptions, ...getUrlOptionsFromProps(props, urlOptions) };
    return props.renderChild({
        forwardedRef: props.forwardedRef,
        ...urlOptions,
    });
}
