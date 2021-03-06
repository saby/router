/**
 * Классы для получения параметров из url в зависимости от типа маски
 */

import {MaskType, IMaskType, calculateMaskType} from './MaskType';
import {decodeParam} from './Helpers';
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
    private readonly urlParts: UrlParts;
    private readonly maskTypes: IMaskType[];
    constructor(mask: string, url: string) {
        this.urlParts = new UrlParts(url);
        this.maskTypes = calculateMaskType(mask, this.urlParts);
    }

    get(): Record<string, string> {
        let params: IParam[] = [];
        this.maskTypes.forEach((maskType) => {
            switch (maskType.maskType) {
                case MaskType.Path:
                    params = [...params, ...PathParams.calculateParams(maskType.mask, this.urlParts.getPath())];
                    break;
                case MaskType.Query:
                    params = [...params, ...QueryParams.createQueryObject()
                                            .calculateParams(maskType.mask, this.urlParts.getQuery())];
                    break;
                case MaskType.PathFragment:
                    params = [...params, ...PathParams.calculateParams(maskType.mask, this.urlParts.getFragment())];
                    break;
                case MaskType.QueryFragment:
                    params = [...params, ...QueryParams.createFragmentObject()
                                            .calculateParams(maskType.mask, this.urlParts.getFragment())];
                    break;
            }
        });
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

        const maskParamIds: Record<string, number> = {};
        let paramIndex: number = 1;
        const fullMask: string = mask.replace(new RegExp('(\/?):([^\/?&#]+)', 'g'),
            (fullMatch, slash, maskId) => {
                maskParamIds[maskId] = paramIndex++;
                // в итоге получим что-то типа '(?:\/([^\/?&#]+))?'
                return '(?:' + (slash ? '\/' : '') + '([^\\/?&#]+))?';
            }).replace(/\/+$/, '');

        const fields: RegExpMatchArray = urlPart.match(new RegExp(fullMask));
        if (fields) {
            // в поле fields[1..n] лежат значения параметров из маски
            for (let i = 0; i < params.length; i++) {
                const maskId: string = params[i].maskId;
                if (maskId in maskParamIds && fields[maskParamIds[maskId]]) {
                    params[i].urlValue = fields[maskParamIds[maskId]];
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
        if (!urlId) {
            return undefined;
        }
        const urlPartsArray: string[] = urlPart.split(/[#\/]/);
        const urlIdIndex: number = urlPartsArray.indexOf(urlId);
        if (!urlPartsArray.length || urlIdIndex < 0) {
            return undefined;
        }
        return urlPartsArray[urlIdIndex + 1] || '';
    }
}

/**
 * Класс для получения параметров из url адреса типа /path/?param=value или /path#param=value
 */
export class QueryParams {

    /**
     * Создает instance класса для работы с query частью url-адреса
     */
    static createQueryObject(): QueryParams {
        return new QueryParams(QueryStringParams.createQueryObject());
    }

    /**
     * Создает instance класса для работы с query-fragment частью url-адреса
     */
    static createFragmentObject(): QueryParams {
        return new QueryParams(QueryStringParams.createFragmentObject());
    }

    private readonly queryStringParams: QueryStringParams;
    constructor(queryStringParams: QueryStringParams) {
        this.queryStringParams = queryStringParams;
    }

    /**
     * Вычислить параметры из url по переданной маске
     * @param mask  маска, по которой разбирается url
     * @param urlPart   часть url адреса, ?param=value, из которой достаются значения
     */
    calculateParams(mask: string, urlPart: string): IParam[] {
        // маска вида query1=:qId1&query3=:qId3 разбивается в объект {query1: 'qId1', query3: 'qId3'}
        const maskParams: Record<string, string> = this.queryStringParams.getParamsFromQueryMaskString(mask);
        // url вида ?query1=value1&query2=value2 разбивается в объект {query1: 'value1', query2: 'value2'}
        const urlParams: Record<string, string> = this.queryStringParams.getParamsFromQueryString(urlPart);
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

/**
 * Из query или query-fragment части url'а вида query=value достает все параметры и возвращает в виде объекта
 * @param input
 */
class QueryStringParams {
    private static readonly QUERY_REGEXP: RegExp = /[?&]/;
    private static readonly FRAGMENT_REGEXP: RegExp = /[#&]/;

    /**
     * Создает instance класса для работы с query частью url-адреса
     */
    static createQueryObject(): QueryStringParams {
        return new QueryStringParams(QueryStringParams.QUERY_REGEXP);
    }

    /**
     * Создает instance класса для работы с query-fragment частью url-адреса
     */
    static createFragmentObject(): QueryStringParams {
        return new QueryStringParams(QueryStringParams.FRAGMENT_REGEXP);
    }

    private readonly splitRegexp: RegExp;

    constructor(splitRegexp: RegExp) {
        this.splitRegexp = splitRegexp;
    }

    /**
     * Строка вида ?query1=value1&query2=value2 разбивается в объект {query1: 'value1', query2: 'value2'}
     * Строка вида #query1=value1&query2=value2 разбивается в объект {query1: 'value1', query2: 'value2'}
     * @param input
     */
    getParamsFromQueryString(input: string): Record<string, string> {
        return this._getQueryParams(input, (value) => {
            return value;
        });
    }

    /**
     * Строка вида ?query1=:qId1&query3=:qId3 разбивается в объект {query1: 'qId1', query3: 'qId3'}
     * Строка вида #query1=:qId1&query3=:qId3 разбивается в объект {query1: 'qId1', query3: 'qId3'}
     * @param input
     */
    getParamsFromQueryMaskString(input: string): Record<string, string> {
        return this._getQueryParams(input, (value) => {
            return value.indexOf(':') === 0 ? value.slice(1) : value;
        });
    }

    /**
     * Разбивка строки на объект
     * @param input
     * @param getValue
     * @private
     */
    private _getQueryParams(input: string, getValue: (value) => string): Record<string, string> {
        const params: Record<string, string> = {};  // параметры из входной строки
        const urlFields: string[] = input.split(this.splitRegexp);
        for (let i = 0; i < urlFields.length; i++) {
            if (!urlFields[i]) {
                continue;
            }
            if (urlFields[i].indexOf('=') === -1) {
                continue;
            }
            const field: string[] = urlFields[i].split('=');
            params[field[0]] = getValue(field[1]);
        }
        return params;
    }

}
