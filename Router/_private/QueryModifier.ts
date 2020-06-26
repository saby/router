/**
 *
 */

import {IParam, UrlModifier} from './UrlModifier';

/**
 *
 */
export default class QueryModifier extends UrlModifier {
    protected reMaskValues: RegExp = /([^\/?&#:]+)=:([^\/?&#]+)/g;

    protected _getUrlValue(urlName: string): string {
        const urlValueMatched: RegExpMatchArray =
            this.urlPart.match(new RegExp('[?&]' + urlName + '=([^\/?&#]+)?'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }

    calculateParams(cfg: Record<string, unknown>): IParam[] {
        return this._getMaskCfgParams(cfg)[0];
    }

    rewrite(cfg: Record<string, unknown>): string {
        const params: IParam[] = this.calculateParams(cfg);
        let newQuery: string = this.urlPart;
        for (let i = 0; i < params.length; i++) {
            const param: IParam = params[i];
            // если нет нового значения и нет текущего значения из url, значит пропускаем этот параметр
            if (param.value === undefined && param.urlValue === undefined) {
                continue;
            }
            // если новое значение не задано, тогда удаляем параметр из url
            if (param.value === undefined) {
                newQuery = newQuery.replace(new RegExp('([?&]?)' + param.urlName + '=' + param.urlValue + '(&?)'),
                    (fullMatch, leftQuery, rightQuery) => {
                        if (!rightQuery) {
                            return '';
                        }
                        if (leftQuery) {
                            return leftQuery;
                        }
                        return '';
                    });
                continue;
            }
            const value: string = this._encodeParam(param.value);
            // если нет текущего значения из url, значит нужно добавить его
            if (param.urlValue === undefined) {
                if (newQuery.indexOf('=') >= 0) {
                    newQuery = [newQuery, '&', param.urlName, '=', value].join('');
                    continue;
                }
                newQuery = [newQuery, param.urlName, '=', value].join('');
                continue;
            }
            // заменяем значение параметра в url новым значением
            newQuery = newQuery.replace(param.urlName + '=' + param.urlValue,
                param.urlName + '=' + value);
        }
        return newQuery;
    }
}
