
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
