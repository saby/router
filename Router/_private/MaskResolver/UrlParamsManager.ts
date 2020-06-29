/**
 *
 */

import {MaskType, MaskTypeManager} from './MaskTypeManager';
import {decodeParam} from './Helpers';
import {IUrlParts, UrlPartsManager} from './UrlPartsManager';

/**
 *
 */
export interface IParam {
    maskId: string;
    urlValue: string;
    urlId: string;
}

/**
 *
 */
export class UrlParamsManager {
    private mask: string;
    private url: string;
    private maskType: MaskType;
    constructor(mask: string, url: string) {
        this.mask = mask;
        this.url = url;
        this.maskType = MaskTypeManager.calculateMaskType(mask, url);
    }
    getUrlParams(): Record<string, string> {
        let params: IParam[];
        const urlParts: IUrlParts = UrlPartsManager.getUrlParts(this.url);
        switch (this.maskType) {
            case MaskType.Path:
                params = PathParams.calculateParams(this.mask, urlParts.path);
                break;
            case MaskType.Query:
                params = QueryParams.calculateParams(this.mask, urlParts.query);
                break;
            case MaskType.PathFragment:
                params = PathParams.calculateParams(this.mask, urlParts.fragment);
                break;
            case MaskType.QueryFragment:
                params = QueryParams.calculateParams(this.mask, urlParts.fragment);
                break;
            case MaskType.Undefined:
                return {};
        }
        const urlParams: Record<string, string> = {};
        params.forEach((param) => {
            if (param.maskId) {
                urlParams[param.maskId] = decodeParam(param.urlValue);
            }
        });
        return urlParams;
    }
}

export class PathParams {
    /**
     * Вычислить параметры из url по переданной маске
     * @param mask  маска, по которой разбирается url
     * @param urlPart   часть url адреса, /path/param/value
     */
    static calculateParams(mask: string, urlPart: string): IParam[] {
        const params: IParam[] = [];
        // регулярка, по которой выявляются параметры из маски
        const reMaskValues: RegExp = /(?:([^\/?&#:]+)\/)?:([^\/?&#]+)/g;
        let maskMatched: RegExpExecArray = reMaskValues.exec(mask);
        let hasAllUrlValues: boolean = true;  // признак, что нашли из url значения всех параметров
        while (maskMatched) {
            const urlId: string = maskMatched[1];
            params.push({
                maskId: maskMatched[2],
                urlValue: PathParams._getUrlValue(urlPart, urlId),
                urlId
            });
            if (hasAllUrlValues) {
                hasAllUrlValues = !!urlId;
            }
            maskMatched = reMaskValues.exec(mask);
        }

        // если ранее нашли значения всех параметров из url, то дальше ничего не ищем
        if (hasAllUrlValues) {
            return params;
        }

        const fullMask: string = mask.replace(new RegExp('(\/?):([^\/?&#]+)', 'g'),
            (fullMatch, slash, paramName) => {
                // в итоге получим что-то типа '(?:\/(?<id>[^\/?&#]+))?'
                return '(?:' + (slash ? '\/' : '') + '(?<' + paramName + '>[^\\/?&#]+))?';
            });

        const fields: RegExpMatchArray = urlPart.match(fullMask);

        if (fields) {
            // в поле fields.groups[<name>] лежит значение параметра
            for (let i = 0; i < params.length; i++) {
                if (fields.groups) {
                    params[i].urlValue = fields.groups[params[i].maskId];
                }
            }
        }
        return params;
    }

    protected static _getUrlValue(urlPart: string, urlId: string): string {
        const urlValueMatched: RegExpMatchArray =
            urlPart.match(new RegExp('[#\/]' + urlId + '/([^\/?&#]+)'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }
}

// export class PathFragmentParams extends PathParams {}

export class QueryParams {
    /**
     * Вычислить параметры из url по переданной маске
     * @param mask  маска, по которой разбирается url
     * @param urlPart   часть url адреса, ?param=value, из которой достаются значения
     * @param includeUrlParams  включать или нет в результат параметры из url, которых не было в маске
     */
    static calculateParams(mask: string, urlPart: string, includeUrlParams: boolean = false): IParam[] {
        // маска вида query1=:qId1&query3=:qId3 разбивается в объект {query1: 'qId1', query3: 'qId3'}
        const maskParams: Record<string, string> = QueryParams._getQueryParamsFromString(mask);
        // url вида ?query1=value1&query2=value2 разбивается в объект {query1: 'value1', query2: 'value2'}
        const urlParams: Record<string, string> = QueryParams._getQueryParamsFromString(urlPart);
        const params: IParam[] = [];
        const calculatedFields: string[] = [];

        [urlParams, maskParams].forEach((data) => {
            for (const urlId in data) {
                if (!data.hasOwnProperty(urlId) || calculatedFields.indexOf(urlId) > -1) {
                    continue;
                }
                params.push({
                    maskId: maskParams[urlId],
                    urlValue: urlParams[urlId],
                    urlId
                });
                calculatedFields.push(urlId);
            }
        });
        return params;
    }

    protected static _getQueryParamsFromString(input: string): Record<string, string> {
        const params: Record<string, string> = {};  // параметры из входной строки
        const urlFields: string[] = input.split(/[?#&]/);
        for (let i = 0; i < urlFields.length; i++) {
            if (!urlFields[i]) {
                continue;
            }
            const field: string[] = urlFields[i].split('=');
            params[field[0]] = field[1].indexOf(':') > -1 ? field[1].slice(1) : field[1];
        }
        return params;
    }
}

// export class QueryFragmentParams extends QueryParams {}
