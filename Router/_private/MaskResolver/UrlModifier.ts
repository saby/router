/**
 * Классы для перезаписи url адреса по заданной маске
 */

import {MaskType, MaskTypeManager} from './MaskTypeManager';
import {encodeParam} from './Helpers';
import {IParam, PathParams, QueryParams} from './UrlParamsGetter';
import {IUrlParts, UrlParts} from './UrlParts';

/**
 * Класс, который по типу маски обрабатывает (замена, добавление, удаление параметров) url адрес
 */
export class UrlModifier {
    private readonly mask: string;
    private readonly cfg: Record<string, unknown>;
    private readonly urlParts: UrlParts;
    private readonly maskType: MaskType;
    constructor(mask: string, cfg: Record<string, unknown>, url: string) {
        this.mask = mask;
        this.urlParts = new UrlParts(url);
        // определим тип маски
        this.maskType = MaskTypeManager.calculateMaskType(mask, this.urlParts);

        this.cfg = cfg.clear ? {} : cfg;
        // когда нужно заменить url переданной маской
        if (cfg.replace) {
            this.urlParts = new UrlParts('');
        }
    }

    modify(): string {
        const newUrlParts: IUrlParts = {};
        switch (this.maskType) {
            case MaskType.Path:
                newUrlParts.path = PathModifier.modify(this.mask, this.cfg, this.urlParts.getPath());
                break;
            case MaskType.Query:
                newUrlParts.query =  QueryModifier.modify(this.mask, this.cfg, this.urlParts.getQuery());
                break;
            case MaskType.PathFragment:
                newUrlParts.fragment = PathModifier.modify(this.mask, this.cfg, this.urlParts.getFragment());
                break;
            case MaskType.QueryFragment:
                newUrlParts.fragment = QueryModifier.modify(this.mask, this.cfg, this.urlParts.getFragment());
                break;
        }
        return this.urlParts.join(newUrlParts);
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
