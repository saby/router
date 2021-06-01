/**
 * Классы для перезаписи url адреса по заданной маске
 */

import {calculateMaskType, IMaskType, MaskType} from './MaskType';
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
    private readonly maskTypes: IMaskType[];
    /**
     * Признак того, при использовании корневой маски (которая начиниется с символа "/")
     * не нужно удалять текущие query параметры из URL-адреса
     */
    private readonly keepQuery: boolean;
    constructor(mask: string, cfg: Record<string, unknown>, url: string) {
        this.mask = mask;
        this.urlParts = new UrlParts(url);
        // определим тип маски
        this.maskTypes = calculateMaskType(mask, this.urlParts);

        this.keepQuery = !!cfg.keepQuery;

        this.cfg = cfg.clear ? {} : cfg;
        // когда нужно заменить url переданной маской
        if (cfg.replace) {
            this.urlParts = new UrlParts('');
        }
    }

    modify(): string {
        const newUrlParts: IUrlParts = {};
        const isReplaceMask: boolean = this.mask.startsWith('/'); // признак того, что маска переписывает url
        this.maskTypes.forEach((maskType) => {
            switch (maskType.maskType) {
                case MaskType.Path:
                    newUrlParts.path = PathModifier.modify(maskType.mask, this.cfg, this.urlParts.getPath());
                    break;
                case MaskType.Query:
                    newUrlParts.query = QueryModifier.createQueryObject()
                                        .modify(maskType.mask, this.cfg, isReplaceMask ? '' : this.urlParts.getQuery());
                    break;
                case MaskType.PathFragment:
                    newUrlParts.fragment = PathModifier.modify(maskType.mask, this.cfg,
                                                               isReplaceMask ? '' : this.urlParts.getFragment());
                    break;
                case MaskType.QueryFragment:
                    newUrlParts.fragment = QueryModifier.createFragmentObject()
                                           .modify(maskType.mask, this.cfg,
                                                   isReplaceMask ? '' : this.urlParts.getFragment());
                    break;
            }
        });
        if (isReplaceMask) {
            const urlPartFields: string[] = this.keepQuery ? ['path', 'fragment'] : ['path', 'query', 'fragment'];
            urlPartFields.forEach((field) => {
                if (newUrlParts[field] === undefined) {
                    newUrlParts[field] = '';
                }
            });
        }
        return this.urlParts.join(newUrlParts);
    }
}

/**
 * Класс для работы с query-параметрами url адреса
 * Используется в случаях, когда маска неизвестна и имеется объект с данными,
 * который нужно добавить в url адрес как query параметры
 */
export class UrlQueryModifier {
    private readonly mask: string;
    private readonly cfg: Record<string, unknown>;
    private readonly urlParts: UrlParts;
    constructor(cfg: Record<string, unknown>, url: string) {
        this.urlParts = new UrlParts(url);

        // cfg.replace - значит нужно очистить текущие query-параметры и вставить, которые пришли на вход
        if (cfg.replace) {
            this.urlParts.clearQuery();
            delete cfg.replace;
        }
        this.cfg = cfg;

        this.mask = '?' + Object.keys(this.cfg)
            .map((key) => `${key}=:${key}`)
            .join('&');
    }

    modify(): string {
        const newUrlParts: IUrlParts = {};
        newUrlParts.query = QueryModifier.createQueryObject()
            .modify(this.mask, this.cfg, this.urlParts.getQuery());
        return this.urlParts.join(newUrlParts);
    }
}

/**
 * Обработка (замена, добавление, удаление параметров по маске) url адреса вида /path/param/value или /path#param/value
 * Основная идея:
 * 1) получить массив значений (что и на что заменять, что добавлять, что удалять) (вызов метода calculateParams)
 * 2) получить каркас нового url (вызов метода _calculateNewUrlPart)
 * 3) разбить каркас нового url на элементы через слеш и в зависимости от состояния (заменить, удалить, добавить)
 *    выполнить необходимое действие
 */
class PathModifier {
    static modify(mask: string, cfg: Record<string, unknown>, urlPart: string): string {
        const params: IParam[] = PathParams.calculateParams(mask, urlPart);
        const newPath: string = PathModifier._calculateNewUrlPart(urlPart, mask, params);
        // url, разбитый через слеш, этот массив и будем модифицировать
        const newPathArray: string[] = newPath.replace(/^[#\/]+/, '').replace(/[#\/]+$/, '').split('/');

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
                    newPathArray.splice(PathModifier._getUrlIdIndex(newPathArray, param.urlId, param.urlValue), 2);
                    continue;
                }
                newPathArray.splice(newPathArray.indexOf(param.urlValue), 1);
                continue;
            }
            const value: string = encodeParam(newValue);
            // если нет текущего значения из url, значит нужно добавить его
            if (param.urlValue === undefined) {
                if (param.urlId) {
                    newPathArray.push(param.urlId);
                }
                newPathArray.push(value);
                continue;
            }
            // заменяем значение параметра в url новым значением
            let replaceIndex: number;
            if (param.urlId) {
                replaceIndex = PathModifier._getUrlIdIndex(newPathArray, param.urlId, param.urlValue) + 1;
            } else {
                replaceIndex = newPathArray.indexOf(param.urlValue);
            }
            newPathArray[replaceIndex] = value;
        }
        return newPathArray.join('/');
    }

    /**
     * Вычисляет новую часть url для замены.
     * Вырезает из маски все, что есть в params (urlPartFromMask).
     * Если получили пустую строку, то вернет исходный urlParts.
     * Если из маски что-то осталось, то ищет этот кусок в исходном urlPart и возвращает все,
     * до правой границы urlPartFromMask.
     * Примеры:
     * 1) urlPart = '/path/param'
     *    mask = 'param/:value'
     *    Результат: '/path/param'
     * 2) urlPart = '/path/old'
     *    mask = '/path/param/:value'
     *    Результат: '/path/param'
     * @param urlPart
     * @param mask
     * @param params
     * @private
     */
    private static _calculateNewUrlPart(urlPart: string, mask: string, params: IParam[]): string {
        let reMaskReplace: string = '';
        let reUrlReplaceItem: string = '';
        const reUrlReplaceItems: string[] = [];
        params.forEach((param) => {
            if (param.urlId) {
                if (reUrlReplaceItem) {
                    reUrlReplaceItems.push(reUrlReplaceItem);
                }
                reUrlReplaceItem = param.urlId + '(\\/[^\\/?&#:]+)?\\/?';
                reMaskReplace += param.urlId + '(\\/:[^\\/?&#:]+)\\/?';
            } else {
                reUrlReplaceItem += '([^\\/?&#:]+\\/?)?';
                reMaskReplace += '(:[^\\/?&#:]+\\/?)';
            }
        });
        if (reUrlReplaceItem) {
            reUrlReplaceItems.push(reUrlReplaceItem);
        }

        let urlPartFromMask: string = mask.replace(new RegExp(reMaskReplace), '');
        urlPartFromMask = urlPartFromMask.replace(/[?#]/, '');
        if (!urlPartFromMask) {
            return urlPart;
        }

        const maskIndexInUrl: number = urlPart.indexOf(urlPartFromMask);
        if (maskIndexInUrl === -1) {
            return urlPartFromMask;
        }

        let newUrlPart: string = urlPart.slice(0, maskIndexInUrl + urlPartFromMask.length);
        const urlPartSliced: string = urlPart.slice(maskIndexInUrl + urlPartFromMask.length);
        reUrlReplaceItems.forEach((reUrlReplace) => {
            const _match: RegExpMatchArray = urlPartSliced.match(new RegExp(reUrlReplace));

            /** напр. есть url /ModuleName/page/business-groups и есть маска /group/:groupId
             * чтобы ошибочно не взять часть этого url (там есть слово "group"),
             * проверим один дополнительный символ слева на равенство символу /
             */
            if (_match) {
                const matchIndex = urlPart.indexOf(_match[0]);
                newUrlPart += (matchIndex === 0 || urlPart[matchIndex - 1] === '/') ? _match[0] : '';
            }
        });
        return newUrlPart;
    }

    /**
     * Получить индекс параметра из массива частей нового url
     * @param urlPartsArray     массив частей url типа ['path', 'param', 'value']
     * @param urlId             идентификатор параметра в url, напр. 'param'
     * @param urlValue          значение параметра из url, напр. 'value'
     * @private
     */
    private static _getUrlIdIndex(urlPartsArray: string[], urlId: string, urlValue: string): number {
        let prevIndex: number = -1;
        while (true) {
            const index: number = urlPartsArray.indexOf(urlId, prevIndex + 1);
            if (index < 0) {
                break;
            }
            if (urlPartsArray[index + 1] && urlPartsArray[index + 1] === urlValue) {
                return index;
            }
            prevIndex = index;
        }
        return prevIndex;
    }
}

/**
 * Обработка (замена, добавление, удаление параметров по маске) url адреса вида /path/?param=value или /path#param=value
 */
class QueryModifier {

    /**
     * Создает instance класса для работы с query частью url-адреса
     */
    static createQueryObject(): QueryModifier {
        return new QueryModifier(QueryParams.createQueryObject());
    }

    /**
     * Создает instance класса для работы с query-fragment частью url-адреса
     */
    static createFragmentObject(): QueryModifier {
        return new QueryModifier(QueryParams.createFragmentObject());
    }

    private readonly queryParams: QueryParams;

    constructor(queryParams: QueryParams) {
        this.queryParams = queryParams;
    }

    modify(mask: string, cfg: Record<string, unknown>, urlPart: string): string {
        const params: IParam[] = this.queryParams.calculateParams(mask, urlPart);
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
