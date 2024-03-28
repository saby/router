/**
 * Библиотека single-page роутинга
 * Более подробно API роутинга описано по {@link /doc/platform/developmentapl/interface-development/routing/#router-api ссылке}
 * @library Router/router
 * @includes Reference Router/_private/Reference
 * @includes Route Router/_private/Route
 * @includes getRootRouter Router/_private/Router/Router#getRootRouter
 * @includes IHistoryState Router/_private/IHistoryState
 * @includes IRouter Router/_private/Router/IRouter
 * @includes IRouterUrl Router/_private/Router/IRouterUrl
 * @includes IUrlRewriter Router/_private/IUrlRewriter
 * @includes IMaskResolver Router/_private/IMaskResolver
 * @includes IHistory Router/_private/IHistory
 * @public
 * @author Мустафин Л.И.
 */

import {
    getRootRouter,
    createNewRouter,
    IRouter,
} from './_private/Router/Router';
import initOnPopState from './_private/Router/InitOnPopState';
initOnPopState(getRootRouter);

import * as Controller from './_private/_deprecated/Controller';
import * as Data from './_private/_deprecated/Data';
import { IHistoryState } from './_private/DataInterfaces';
import { IRouterUrl } from './_private/Router/RouterUrl';
import { IMaskResolver } from './_private/MaskResolver';
import { IHistory } from './_private/History';
import * as History from './_private/_deprecated/History';
import * as MaskResolver from './_private/_deprecated/MaskResolver';
import { getAppNameByUrl } from './_private/MaskResolver';
import _UrlRewriter, { IUrlRewriter } from './_private/UrlRewriter';
const UrlRewriter = _UrlRewriter.getInstance();

import { default as Reference } from './_private/Reference';
import { default as Route } from './_private/Route';

export {
    Controller,
    Data,
    History,
    MaskResolver,
    UrlRewriter,
    Reference,
    Route,
    getAppNameByUrl,
    getRootRouter,
    createNewRouter,
    IHistoryState,
    IRouter,
    IRouterUrl,
    IUrlRewriter,
    IMaskResolver,
    IHistory,
};
