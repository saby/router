/// <amd-module name="Router/router" />

/*
 * Single-page routing library
 * @library Router/router
 * @includes Controller Router/_private/Controller
 * @includes Data Router/_private/Data
 * @includes History Router/_private/History
 * @includes MaskResolver Router/_private/MaskResolver
 * @includes UrlRewriter Router/_private/UrlRewriter
 * @includes Reference Router/_private/Reference
 * @includes Route Router/_private/Route
 * @public
 * @author Мустафин Л.И.
 */
/**
 * Библиотека single-page роутинга
 * @library Router/router
 * @includes Controller Router/_private/Controller
 * @includes Data Router/_private/Data
 * @includes History Router/_private/History
 * @includes MaskResolver Router/_private/MaskResolver
 * @includes UrlRewriter Router/_private/UrlRewriter
 * @includes Reference Router/_private/Reference
 * @includes Route Router/_private/Route
 * @public
 * @author Мустафин Л.И.
 */

import * as Controller from './_private/Controller';
import * as Data from './_private/Data';
import * as History from './_private/History';
import * as MaskResolver from './_private/MaskResolver';
import * as UrlRewriter from './_private/UrlRewriter';

import { default as Reference } from './_private/Reference';
import { default as Route } from './_private/Route';

export { Controller, Data, History, MaskResolver, UrlRewriter, Reference, Route };
