import { Ref, FunctionComponent } from 'react';
import { IReferenceProps, calculateReferenceHref } from 'Router/router';
import { getRootRouter } from 'Router/router';

/**
 * Опции компонента Reference.server
 * @public
 */
export interface IServerReferenceProps
    extends Pick<
        IReferenceProps,
        | 'state'
        | 'href'
        | 'clear'
        | 'replace'
        | 'trailingSlash'
        | 'children'
        | 'className'
        | 'forwardedRef'
        | 'data-qa'
    > {
    renderChild: FunctionComponent<{
        className?: string;
        href: string;
        forwardedRef?: Ref<HTMLElement>;
        'data-qa'?: string;
    }>;
    className?: string;
    forwardedRef?: Ref<HTMLElement>;
    'data-qa'?: string;
    [key: string]: unknown;
}

/**
 * RSC-реализация компонента Router/router:Reference
 */
export function Reference(props: IServerReferenceProps) {
    const Router = getRootRouter();
    const state = calculateReferenceHref(props, Router);
    const dataProps = 'data-qa' in props ? { 'data-qa': props['data-qa'] } : {};
    return props.renderChild({
        className: props.className,
        href: state.href || state.state,
        forwardedRef: props.forwardedRef,
        ...dataProps,
    });
}
