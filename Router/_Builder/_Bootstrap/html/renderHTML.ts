import { IRenderFullData, newLine, getBaseScripts } from './startScript';

/**
 * Формирует минимальный html для демки require
 */
export function renderEmptyDemoHTML(values: IRenderFullData): string {
    return [
        '<!DOCTYPE html>',
        `<html lang=ru>`,
        '  <head>',
        `    ${values.HeadAPIData}`,
        '  </head>',
        `  <body>`,
        `    <div id="wasaby-content" style="width: inherit; height: inherit;">`,
        '    </div>',
        getBaseScripts(values),
        '  </body>',
        '</html>',
    ].join(newLine);
}
