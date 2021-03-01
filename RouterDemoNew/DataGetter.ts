/*
Это модуль для демонстрации некоего загрузчика данных
 */

import {MaskResolver} from 'Router/router';

export interface IOptions {
    templateName: string;
    templateOptions: object;
}

export function getPageConfigSPA(pageId: string): IOptions {
    switch (pageId) {
        case 'UserModule2':
            return {templateName: 'RouterDemoNew/UserModules/UserModule2', templateOptions: {data: 'UserModule2 data'}};
        case 'UserModule1':
        default:
            return {templateName: 'RouterDemoNew/UserModules/UserModule1', templateOptions: {data: 'UserModule1 data'}};
    }
}

export async function getPageConfig(url: string): Promise<IOptions> {
    const data = MaskResolver.calculateUrlParams('/page/:pageId', url);
    return getPageConfigSPA(data.pageId);
}
