/**
 *
 */

import {IParam, UrlModifier} from './UrlModifier';

/**
 *
 */
export default class PathModifier extends UrlModifier {
    protected reMaskValues: RegExp = /(?:([^\/?&#:]+)\/)?:([^\/?&#]+)/g;

    protected _getUrlValue(urlName: string): string {
        const urlValueMatched: RegExpMatchArray =
            this.urlPart.match(new RegExp('[\/]' + urlName + '/([^\/?&#]+)'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }

    calculateParams(cfg: Record<string, unknown>): IParam[] {
        const mask: string = this.mask;
        const [params, hasAllUrlValues]: [IParam[], boolean] = this._getMaskCfgParams(cfg);

        // если ранее нашли значения всех параметров из url, то дальше ничего не ищем
        if (hasAllUrlValues) {
            return params;
        }

        const fullMask: string = mask.replace(new RegExp('(\/?):([^\/?&#]+)', 'g'),
            (fullMatch, slash, paramName) => {
                // в итоге получим что-то типа '(?:\/(?<id>[^\/?&#]+))?'
                return '(?:' + (slash ? '\/' : '') + '(?<' + paramName + '>[^\\/?&#]+))?';
            });

        const fields: RegExpMatchArray = this.urlPart.match(fullMask);

        if (fields) {
            // в поле fields.groups[<name>] лежит значение параметра
            for (let i = 0; i < params.length; i++) {
                if (fields.groups) {
                    params[i].urlValue = fields.groups[params[i].name];
                }
            }
        }
        return params;
    }

    rewrite(cfg: Record<string, unknown>): string {
        const params: IParam[] = this.calculateParams(cfg);
        let newPath: string = this.urlPart;
        for (let i = 0; i < params.length; i++) {
            const param: IParam = params[i];
            // если нет нового значения и нет текущего значения из url, значит пропускаем этот параметр
            if (param.value === undefined && param.urlValue === undefined) {
                continue;
            }
            // если новое значение не задано, тогда удаляем параметр из url
            if (param.value === undefined) {
                if (param.urlName) {
                    newPath = newPath.replace(new RegExp('\/' + param.urlName + '\/' + param.urlValue), '');
                    continue;
                }
                newPath = newPath.replace(new RegExp('\/' + param.urlValue), '');
                continue;
            }
            const value: string = this._encodeParam(param.value);
            // если нет текущего значения из url, значит нужно добавить его
            if (param.urlValue === undefined) {
                if (param.urlName) {
                    newPath = [newPath, '/', param.urlName, '/', value].join('');
                    continue;
                }
                newPath = [newPath, '/', value].join('');
                continue;
            }
            // заменяем значение параметра в url новым значением
            newPath = newPath.replace(new RegExp('\/' + param.urlValue), '/' + value);
        }
        return newPath;
    }
}
