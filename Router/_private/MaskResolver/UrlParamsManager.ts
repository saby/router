/**
 *
 */

import {MaskType, MaskTypeManager} from './MaskTypeManager';
import {decodeParam} from './Helpers';

/**
 *
 */
export interface IParam {
    maskId: string;
    newValue: unknown;
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
        let manager: UrlParams;
        switch (this.maskType) {
            case MaskType.Path:
                manager = new PathParams(this.mask, this.url);
                break;
            case MaskType.Query:
                manager = new QueryParams(this.mask, this.url);
                break;
            case MaskType.PathFragment:
                manager = new PathFragmentParams(this.mask, this.url);
                break;
            case MaskType.QueryFragment:
                manager = new QueryFragmentParams(this.mask, this.url);
                break;
            case MaskType.Undefined:
                return {};
        }
        const urlParams: Record<string, string> = {};
        manager.calculateParams().forEach((param) => {
            urlParams[param.maskId] = decodeParam(param.urlValue);
        });
        return urlParams;
    }
}

abstract class UrlParams {
    protected mask: string;
    // здесь лежит часть url адреса: path, query или fragment
    protected urlPart: string;
    // регулярка, по которой выявляются параметры из маски
    protected abstract reMaskValues: RegExp;
    constructor(mask: string, urlPart: string) {
        this.mask = mask;
        this.urlPart = urlPart;
    }

    calculateParams(cfg?: Record<string, unknown>): IParam[] {
        cfg = cfg || {};
        const params: IParam[] = [];
        let maskMatched: RegExpExecArray = this.reMaskValues.exec(this.mask);
        let hasAllUrlValues: boolean = true;  // признак, что нашли из url значения всех параметров
        while (maskMatched) {
            const urlId: string = maskMatched[1];
            params.push({
                maskId: maskMatched[2],
                newValue: cfg[maskMatched[2]],
                urlValue: this._getUrlValue(urlId),
                urlId
            });
            if (hasAllUrlValues) {
                hasAllUrlValues = !!urlId;
            }
            maskMatched = this.reMaskValues.exec(this.mask);
        }

        // если ранее нашли значения всех параметров из url, то дальше ничего не ищем
        if (hasAllUrlValues) {
            return params;
        }

        return this._getOtherUrlParams(params);
    }

    /**
     * Получить значение параметра из url для указанного параметра
     * напр. mask = 'param/:value'
     *       url = '/param/pvalue'
     *       urlId = 'param'
     * в итоге получим value = 'pvalue'
     * @param urlId
     * @private
     */
    protected abstract _getUrlValue(urlId: string): string;

    /**
     * Получить значения параметров указанных в маске из url
     * напр. mask = 'param/:value/:ident'
     *       url = '/param/pvalue/pid/'
     * в итоге получим:
     *       value = 'pvalue'
     *       ident = 'pid'
     * @param params
     * @private
     */
    protected abstract _getOtherUrlParams(params: IParam[]): IParam[];
}

class PathParams extends UrlParams {
    protected reMaskValues: RegExp = /(?:([^\/?&#:]+)\/)?:([^\/?&#]+)/g;

    protected _getUrlValue(urlId: string): string {
        const urlValueMatched: RegExpMatchArray =
            this.urlPart.match(new RegExp('[\/]' + urlId + '/([^\/?&#]+)'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }

    protected _getOtherUrlParams(params: IParam[]): IParam[] {
        const fullMask: string = this.mask.replace(new RegExp('(\/?):([^\/?&#]+)', 'g'),
            (fullMatch, slash, paramName) => {
                // в итоге получим что-то типа '(?:\/(?<id>[^\/?&#]+))?'
                return '(?:' + (slash ? '\/' : '') + '(?<' + paramName + '>[^\\/?&#]+))?';
            });

        const fields: RegExpMatchArray = this.urlPart.match(fullMask);

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
}

class QueryParams extends UrlParams {
    protected reMaskValues: RegExp = /([^\/?&#:]+)=:([^\/?&#]+)/g;

    protected _getUrlValue(urlId: string): string {
        const urlValueMatched: RegExpMatchArray =
            this.urlPart.match(new RegExp('[?&]' + urlId + '=([^\/?&#]+)?'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }

    protected _getOtherUrlParams(params: IParam[]): IParam[] {
        return params;
    }
}

class PathFragmentParams extends PathParams {
    protected _getUrlValue(urlId: string): string {
        const urlValueMatched: RegExpMatchArray =
            this.urlPart.match(new RegExp('[\/#]' + urlId + '/([^\/?&#]+)'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }
}

class QueryFragmentParams extends QueryParams {
    protected _getUrlValue(urlId: string): string {
        const urlValueMatched: RegExpMatchArray =
            this.urlPart.match(new RegExp('[&#]' + urlId + '=([^\/?&#]+)?'));
        return urlValueMatched ? urlValueMatched[1] : undefined;
    }
}
