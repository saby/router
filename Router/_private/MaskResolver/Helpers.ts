/**
 * Кодирует значения параметров url (пробелы, проценты и т.п.)
 * @param param
 */
export function encodeParam(param: unknown): string {
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

/**
 * Раскодирует значения параметров из url (пробелы, проценты и т.п.)
 * @param param
 */
export function decodeParam(param: string): string {
    let result: string = param;
    if (typeof result !== 'undefined') {
        try {
            result = decodeURIComponent(result);
        } catch (e) {
            // If decoder throws an error, that means that the original
            // URL was malformed. If the user enters an invalid URL,
            // ignore the decoding (because it can't be decoded by the
            // browser) and return the string as is.
        }
    }
    return result;
}

/**
 * Из строки вида param=value или param=:value достает все параметры и возвращает в виде объекта
 * Строка вида query1=:qId1&query3=:qId3 разбивается в объект {query1: 'qId1', query3: 'qId3'}
 * Строка вида ?query1=value1&query2=value2 разбивается в объект {query1: 'value1', query2: 'value2'}
 * @param input
 */
export function getParamsFromQueryString(input: string): Record<string, string> {
    const params: Record<string, string> = {};  // параметры из входной строки
    const urlFields: string[] = input.split(/[?#&]/);
    for (let i = 0; i < urlFields.length; i++) {
        if (!urlFields[i]) {
            continue;
        }
        if (urlFields[i].indexOf('=') === -1) {
            continue;
        }
        const field: string[] = urlFields[i].split('=');
        params[field[0]] = field[1].indexOf(':') > -1 ? field[1].slice(1) : field[1];
    }
    return params;
}
