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
} from './startScript';
import { prepareScript } from './prepareScript';

/**
 * Генератор html-разметки при потоковом построении страницы
 */
export class PartialHtmlGenerator {
    constructor(
        private onlyCoreScript: boolean = false,
        private startScriptGenerator: typeof getStartScript = getStartScript
    ) {}

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

        return html ? newLine + html : html;
    }

    renderEnd(values: IRenderFullData): string {
        /* При построении RSC до последнего блока html неизвестно, будет ли на странице хоть какой-то js.
         * Поэтому здесь выводим values.JSLinksAPIBaseData, если оно не пустое
         */
        let html = [
            values.HeadAPIData,
            values.JSLinksAPIBaseData,
            `<script>window['csrStartTime'] = Date.now();</script>`,
            `  </head>`,
            `  <body ${getBodyAttrs(values)}>`,
            `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">${values.controlsHTML}</div>`,
        ].filter((row) => {
            return !!row;
        });

        if (!this.onlyCoreScript) {
            html.push(getTimeTesterScripts(values));
        }

        html = html.concat([
            getDepsScripts(values),
            '    <div id="wasabyStartScript">',
            `      ${prepareScript(this.startScriptGenerator(values))}`,
            '    </div>',
        ]);

        if (!this.onlyCoreScript) {
            html.push(getMaintenanceContainer());
            html.push(getCheckSoftware());
        }

        html.push(`  </body></html>`);

        return html.join(newLine);
    }
}
