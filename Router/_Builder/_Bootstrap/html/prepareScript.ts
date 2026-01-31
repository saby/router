const removeNewLinePattern = /(\r\n|\n|\r|)/gm;
const removeDoubleWhiteSpaces = /\s+/g;

/**
 * Подготовить строку для вставки в head - "минификация"
 */
export function prepareScript(str: string): string {
    return str.replace(removeNewLinePattern, '').replace(removeDoubleWhiteSpaces, ' ');
}
