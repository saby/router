/// <amd-module name="Router/_private/MaskResolver" />

/**
 * Набор методов обеспечивающих работу с масками и параметрами URL
 * @module
 * @name Router/_private/MaskResolver
 * @author Мустафин Л.И.
 */

import * as Data from './Data';
import * as UrlRewriter from './UrlRewriter';
import {UrlParamsManager} from './MaskResolver/UrlParamsManager';
import {UrlModifyManager} from './MaskResolver/UrlRewriteManager';

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
    const manager: UrlParamsManager = new UrlParamsManager(mask, url || UrlRewriter.get(Data.getRelativeUrl()));
    return manager.getUrlParams();
}

export function calculateHref(mask: string, cfg: Record<string, unknown>): string {
    const manager: UrlModifyManager = new UrlModifyManager(mask, cfg, UrlRewriter.get(Data.getRelativeUrl()));
    return manager.rewrite();
}
