import { controller } from 'I18n/i18n';
import {
    getBodyAttrs,
    getCheckSoftware,
    getDepsScripts,
    getMaintenanceContainer,
    getStartScript,
    getTimeTesterScripts,
    IRenderFullData,
    newLine,
    prepareScript,
} from './HtmlGenerator';

/**
 * Генератор html-разметки при потоковом построении страницы
 */
export class PartialHtmlGenerator {
    constructor() {}

    /**
     * Генерация начала html-разметки
     */
    renderStart(values: IRenderFullData) {
        const lang = values.lang || controller.currentLang || 'ru';
        const htmlParts = ['<!DOCTYPE html>', `<html lang=${lang}>`, '  <head>'];
        htmlParts.push(this.render(values));

        return htmlParts.join(newLine);
    }

    render(values: IRenderFullData): string {
        const html = [values.HeadAPIData, values.JSLinksAPIBaseData, values.JSLinksAPIData]
            .filter((row) => {
                return !!row;
            })
            .join(newLine);

        return html;
    }

    renderEnd(values: IRenderFullData): string {
        const html = [
            values.HeadAPIData,
            `  </head>`,
            `  <body ${getBodyAttrs(values)}>`,
            `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">`,
            `      ${values.controlsHTML}`,
            '    </div>',
            getTimeTesterScripts(values),
            getDepsScripts(values),
            '    <div id="wasabyStartScript">',
            `      ${prepareScript(getStartScript(values))}`,
            '    </div>',
            getMaintenanceContainer(),
            getCheckSoftware(),
            '  </body>',
            '</html>',
        ].join(newLine);

        return html;
    }
}
