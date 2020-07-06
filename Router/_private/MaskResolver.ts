/// <amd-module name="Router/_private/MaskResolver" />

/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @name Router/_private/MaskResolver
 * @author Мустафин Л.И.
 */

import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';
import {UrlParamsGetter} from './MaskResolver/UrlParamsGetter';
import {UrlModifier} from './MaskResolver/UrlModifier';

// TODO Remove this? используется в Route.Controller
export function getAppNameByUrl(url: string): string {
    let folderName: string = UrlRewriter.get(url) || '';

    // Folder name for url '/sign_in?return=mainpage' should be 'sign_in'
    if (folderName.indexOf('?') !== -1) {
        folderName = folderName.replace(/\?.*/, '');
    }

    // Folder name for url '/news#group=testGroup' should be 'news'
    if (folderName.indexOf('#') !== -1) {
        folderName = folderName.replace(/#.*/, '');
    }

    // Folder name for '/Tasks/onMe' is 'Tasks', but folder name for
    // 'tasks.html' is 'tasks.html'
    if (folderName.indexOf('/') !== -1) {
        folderName = folderName.split('/')[1];
    }

    return folderName + '/Index';
}

export function calculateUrlParams(mask: string, url?: string): Record<string, string> {
    const getter: UrlParamsGetter = new UrlParamsGetter(mask, url || UrlRewriter.get(Data.getRelativeUrl()));
    return getter.get();
}

export function calculateHref(mask: string, cfg: Record<string, unknown>): string {
    const modifier: UrlModifier = new UrlModifier(mask, cfg, UrlRewriter.get(Data.getRelativeUrl()));
    return modifier.modify();
}
