/**
 * Классы для получения параметров из url в зависимости от типа маски
 */

import {MaskType, MaskTypeManager} from './MaskTypeManager';
import {decodeParam, getParamsFromQueryString} from './Helpers';
import {UrlParts} from './UrlParts';

/**
 * Интерфейс параметров url адреса
 */
export interface IParam {
    maskId: string;  // идентификатор параметра из маски, param/:valueId -> valueId
    urlValue: string;  // значение параметра из url, /param/value -> value
    urlId: string;  // название параметра в url, /param/value -> param
}

/**
 * Класс для получения параметров из url адреса, в зависимости от типа маски и url адреса
 */
export class UrlParamsGetter {
    private readonly mask: string;
    private readonly urlParts: UrlParts;
    private readonly maskType: MaskType;
    constructor(mask: string, url: string) {
        this.mask = mask;
        this.urlParts = new UrlParts(url);
        this.maskType = MaskTypeManager.calculateMaskType(mask, this.urlParts);
    }

    get(): Record<string, string> {
        let params: IParam[];
        switch (this.maskType) {
            case MaskType.Path:
                params = PathParams.calculateParams(this.mask, this.urlParts.getPath());
                break;
            case MaskType.Query:
                params = QueryParams.calculateParams(this.mask, this.urlParts.getQuery());
                break;
            case MaskType.PathFragment:
                params = PathParams.calculateParams(this.mask, this.urlParts.getFragment());
                break;
            case MaskType.QueryFragment:
                params = QueryParams.calculateParams(this.mask, this.urlParts.getFragment());
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

/**
 * Класс для получения параметров из url адреса типа /param/value или /path#param/value
 */
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

    /**
     * Получить значение указанного параметра из части url
     * @param urlPart   часть url вида /path/param/value/
     * @param urlId     название параметра, напр. param
     * @private
     */
    protected static _getUrlValue(urlPart: string, urlId: string): string {
        const urlValueMatched: RegExpMatchArray =
            urlPart.match(new RegExp('[#\/]' + urlId + '/([^\/?&#]+)'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }
}

/**
 * Класс для получения параметров из url адреса типа /path/?param=value или /path#param=value
 */
export class QueryParams {
    /**
     * Вычислить параметры из url по переданной маске
     * @param mask  маска, по которой разбирается url
     * @param urlPart   часть url адреса, ?param=value, из которой достаются значения
     */
    static calculateParams(mask: string, urlPart: string): IParam[] {
        // маска вида query1=:qId1&query3=:qId3 разбивается в объект {query1: 'qId1', query3: 'qId3'}
        const maskParams: Record<string, string> = getParamsFromQueryString(mask);
        // url вида ?query1=value1&query2=value2 разбивается в объект {query1: 'value1', query2: 'value2'}
        const urlParams: Record<string, string> = getParamsFromQueryString(urlPart);
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
}
