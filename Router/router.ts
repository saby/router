/**
 * Библиотека single-page роутинга
 * Более подробно API роутинга описано по {@link https://link.sbis.ru/article/9e0b0406-295b-4bc9-a53e-693244dc7bad#toc_f0bc75e2-531c-47fd-81d2-ab2e94a1670d ссылке}
 * @library
 * @public
 * @author Мустафин Л.И.
 * @module
 */

import { getRootRouter, createNewRouter, IRouter } from './_private/Router/Router';
import initOnPopState from './_private/Router/InitOnPopState';
initOnPopState(getRootRouter);

import * as Controller from './_private/_deprecated/Controller';
import * as Data from './_private/_deprecated/Data';
import UrlRewriter from './_private/_deprecated/UrlRewriter';
import {
    IHistoryState,
    IRegisterableComponent,
    TStateChangeFunction,
    TOnChangeHistoryState,
} from './_private/DataInterfaces';
import { IRouterUrl } from './_private/Router/RouterUrl';
import { IMaskResolver } from './_private/MaskResolver';
import { IHistory } from './_private/History';
import * as History from './_private/_deprecated/History';
import * as MaskResolver from './_private/_deprecated/MaskResolver';
import { getAppNameByUrl } from './_private/MaskResolver';
import { IUrlRewriter } from './_private/UrlRewriter/IUrlRewriter';

export {
    default as Reference,
    Reference as BaseReference,
    IReferenceProps,
    ISyntheticMouseEvent,
    IReferenceState,
} from './_private/Reference';
export {
    default as Route,
    Route as BaseRoute,
    IRouteProps as IBaseRouteProps,
    TGetDataToRender,
    IProgressBar,
    IRouteWrapperProps as IRouteProps,
} from './_private/Route';
export { default as Context } from './_private/context/Context';
export { default as ContextProvider, IContextProps } from './_private/context/ContextProvider';
export { useRouter } from './_private/context/useRouter';
export { withRouter } from './_private/context/withRouter';

export { IUrlParams, IUrlQueryParams } from './_private/MaskResolver/UrlModifier';

export {
    Controller,
    Data,
    History,
    MaskResolver,
    UrlRewriter,
    getAppNameByUrl,
    getRootRouter,
    createNewRouter,
    IHistoryState,
    IRegisterableComponent,
    TStateChangeFunction,
    TOnChangeHistoryState,
    IRouter,
    IRouterUrl,
    IUrlRewriter,
    IMaskResolver,
    IHistory,
};

export { enablePartialSend, disablePartialSend } from './_private/partialRender';
