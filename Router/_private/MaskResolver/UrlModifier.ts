/**
 *
 */

/**
 *
 */
export interface IParam {
    name: string;
    value: unknown;
    urlName: string;
    urlValue?: string;
}

/**
 *
 */
export class UrlModifier {
    protected mask: string;
    // здесь лежит часть url адреса: path, query или fragment
    protected urlPart: string;
    // регулярка, по которой выявляются параметры из маски
    protected reMaskValues: RegExp;
    constructor(mask: string, urlPart: string) {
        this.mask = mask;
        this.urlPart = urlPart;
    }

    calculateParams(cfg: Record<string, unknown>): IParam[] {
        throw new Error('Need to implement in subclass');
    }

    protected _getMaskCfgParams(cfg: Record<string, unknown>): [IParam[], boolean] {
        const params: IParam[] = [];
        let maskMatched: RegExpExecArray = this.reMaskValues.exec(this.mask);
        let hasAllUrlValues: boolean = true;  // признак, что нашли из url значения всех параметров
        while (maskMatched) {
            const urlName: string = maskMatched[1];
            params.push({
                name: maskMatched[2],
                value: cfg[maskMatched[2]],
                urlName,
                urlValue: this._getUrlValue(urlName)
            });
            if (hasAllUrlValues) {
                hasAllUrlValues = !!urlName;
            }
            maskMatched = this.reMaskValues.exec(this.mask);
        }
        return [params, hasAllUrlValues];
    }

    protected _getUrlValue(urlName: string): string {
        throw new Error('Need to implement in subclass');
        // const urlValueMatched: RegExpMatchArray = this.urlPart.match(new RegExp(''));
        // return urlValueMatched ? urlValueMatched[1] : undefined;
    }

    rewrite(cfg: Record<string, unknown>): string {
        throw new Error('Need to implement in subclass');
    }

    protected _encodeParam(param: unknown): string {
        const type: 'string'|'number'|'bigint'|'boolean'|'symbol'|'undefined'|'object'|'function' = typeof param;
        let result: unknown = param;
        if (type !== 'undefined') {
            if (type !== 'string') {
                // Convert parameter to string by calling JSON.stringify
                result = JSON.stringify(result);
            }
            result = encodeURIComponent(result as string);
        }
        return result as string;
    }

}
