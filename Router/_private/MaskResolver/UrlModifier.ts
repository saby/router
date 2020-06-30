/**
 * Классы для перезаписи url адреса по заданной маске
 */

import * as UrlRewriter from '../UrlRewriter';
import * as Data from '../Data';
import {MaskType, MaskTypeManager} from './MaskTypeManager';
import {encodeParam} from './Helpers';
import {IParam, PathParams, QueryParams} from './UrlParamsGetter';
import {IUrlParts, UrlPartsManager} from './UrlPartsManager';

/**
 * Класс, который по типу маски обрабатывает (замена, добавление, удаление параметров) url адрес
 */
export class UrlModifier {
    private readonly mask: string;
    private readonly url: string;
    private readonly cfg: Record<string, unknown>;
    private readonly urlParts: IUrlParts;
    private readonly maskType: MaskType;
    constructor(mask: string, cfg: Record<string, unknown>, url?: string) {
        this.mask = mask;
        this.url = url || UrlRewriter.get(Data.getRelativeUrl());

        this.cfg = cfg.clear ? {} : cfg;
        // когда нужно заменить url переданной маской
        if (cfg.replace) {
            this.urlParts = {path: '', query: '', fragment: ''};
        } else {
            this.urlParts = UrlPartsManager.getUrlParts(this.url);
        }

        // определим тип маски
        this.maskType = MaskTypeManager.calculateMaskType(mask, this.url);
    }

    modify(): string {
        switch (this.maskType) {
            case MaskType.Path:
                this.urlParts.path = PathModifier.modify(this.mask, this.cfg, this.urlParts.path);
                break;
            case MaskType.Query:
                this.urlParts.query =  QueryModifier.modify(this.mask, this.cfg, this.urlParts.query);
                break;
            case MaskType.PathFragment:
                this.urlParts.fragment = PathModifier.modify(this.mask, this.cfg, this.urlParts.fragment);
                break;
            case MaskType.QueryFragment:
                this.urlParts.fragment = QueryModifier.modify(this.mask, this.cfg, this.urlParts.fragment);
                break;
            case MaskType.Undefined:
                return this.url;
        }
        return UrlPartsManager.joinUrlParts(this.urlParts);
    }
}

/**
 * Обработка (замена, добавление, удаление параметров по маске) url адреса вида /path/param/value или /path#param/value
 */
class PathModifier {
    static modify(mask: string, cfg: Record<string, unknown>, urlPart: string): string {
        const params: IParam[] = PathParams.calculateParams(mask, urlPart);
        let newPath: string = urlPart;
        for (let i = 0; i < params.length; i++) {
            const param: IParam = params[i];
            const newValue: unknown = cfg[param.maskId];
            // если нет нового значения и нет текущего значения из url, значит пропускаем этот параметр
            if (newValue === undefined && param.urlValue === undefined) {
                continue;
            }
            // если новое значение не задано, тогда удаляем параметр из url
            if (newValue === undefined) {
                if (param.urlId) {
                    newPath = newPath.replace(new RegExp('[#\/]' + param.urlId + '\/' + param.urlValue), '');
                    continue;
                }
                newPath = newPath.replace(new RegExp('[#\/]' + param.urlValue), '');
                continue;
            }
            const value: string = encodeParam(newValue);
            // если нет текущего значения из url, значит нужно добавить его
            if (param.urlValue === undefined) {
                if (param.urlId) {
                    newPath = [newPath, '/', param.urlId, '/', value].join('');
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

/**
 * Обработка (замена, добавление, удаление параметров по маске) url адреса вида /path/?param=value или /path#param=value
 */
class QueryModifier {
    static modify(mask: string, cfg: Record<string, unknown>, urlPart: string): string {
        const params: IParam[] = QueryParams.calculateParams(mask, urlPart);
        const newQueryParams: Record<string, string> = {};
        for (let i = 0; i < params.length; i++) {
            const param: IParam = params[i];
            // если нет идентификатора из маски, значит этот параметр из url - его просто добавим в результат
            if (param.maskId === undefined) {
                newQueryParams[param.urlId] = param.urlValue;
                continue;
            }
            const newValue: unknown = cfg[param.maskId];
            // если есть новое значение, то просто добавим параметр с этим новым значением
            if (newValue !== undefined) {
                newQueryParams[param.urlId] = encodeParam(newValue);
            }
            // 1) если нет нового значения newValue и нет текущего значения из url param.urlValue,
            // значит пропускаем этот параметр
            // 2) если нет нового значения newValue, тогда считаем,
            // что нужно удалить параметр из url - пропускаем этот параметр
        }
        const newQuery: string[] = [];
        for (const urlId in newQueryParams) {
            if (!newQueryParams.hasOwnProperty(urlId)) {
                continue;
            }
            newQuery.push([urlId, newQueryParams[urlId]].join('='));
        }
        return newQuery.join('&');
    }
}
