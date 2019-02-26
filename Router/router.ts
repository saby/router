/// <amd-module name="Router/router" />

// @ts-ignore
import { IoC } from 'Env/Env';

import * as Controller from './_private/Controller';
import * as Data from './_private/Data';
import * as History from './_private/History';
import * as MaskResolver from './_private/MaskResolver';
import * as UrlRewriter from './_private/UrlRewriter';

// @ts-ignore
import * as Reference from './_private/Reference';
// @ts-ignore
import * as Route from './_private/Route';

export {
   Controller,
   Data,
   History,
   MaskResolver,
   UrlRewriter,

   Reference,
   Route
};

export function logDeprecatedWrapper(oldModuleName, newFieldName) {
   IoC.resolve('ILogger').log(
      'Router/router',
      `"${oldModuleName}" wrapper is deprecated and will be removed. Require ` +
      `"Router/router" library and use ${newFieldName} from it instead.`
   );
}