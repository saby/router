import type { IRouter } from '../Router/Router';
import type { IReferenceProps } from './IReferenceProps';

/**
 * Метод, который по переданным опциям вычисляет {state, href} для Reference
 * @private
 */
export function calculateReferenceHref(
    props: IReferenceProps,
    router: IRouter,
    currentUrl?: string
): { state: string; href: string } {
    const state = router.maskResolver.calculateState(props.state, props, currentUrl);
    let href;
    if (props.href) {
        const url = router.urlRewriter.getReverse(currentUrl || router.url.getStateUrl());
        href = router.maskResolver.calculateUrl(props.href, props, url);
    } else {
        const _href = router.urlRewriter.getReverse(state);
        href = router.url.getRealUrl(_href);
    }
    return { state, href };
}
