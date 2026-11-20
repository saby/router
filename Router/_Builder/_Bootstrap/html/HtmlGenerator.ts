import { controller } from 'I18n/i18n';
import {
    IRenderFullData,
    newLine,
    getBodyAttrs,
    getBaseScripts,
    getTimeTesterScripts,
    getDepsScripts,
    getStartScript,
    getMaintenanceContainer,
    getCheckSoftware,
} from './startScript';
import { prepareScript } from './prepareScript';

export function renderHTML(values: IRenderFullData): string {
    const lang = values.lang || controller.currentLang || 'ru';
    return [
        '<!DOCTYPE html>',
        `<html lang=${lang}>`,
        '  <head>',
        `    ${values.HeadAPIData}`,
        `<script>window['csrStartTime'] = Date.now();</script>`,
        '  </head>',
        `  <body ${getBodyAttrs(values)}>`,
        `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">`,
        `      ${values.controlsHTML}`,
        '    </div>',
        getBaseScripts(values),
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
}

export class HtmlGenerator {
    constructor(
        private onlyCoreScript: boolean = false,
        private startScriptGenerator: typeof getStartScript = getStartScript
    ) {}

    /**
     * Полная генерация HTML (аналог старой renderHTML)
     */
    render(values: IRenderFullData): string {
        const lang = values.lang || controller.currentLang || 'ru';
        const parts = [
            '<!DOCTYPE html>',
            `<html lang=${lang}>`,
            '  <head>',
            `    ${values.HeadAPIData}`,
            `<script>window['csrStartTime'] = Date.now();</script>`,
            '  </head>',
            `  <body ${getBodyAttrs(values)}>`,
            `    <div id="wasaby-content" style="width: inherit; height: inherit;" application="${values.moduleName}">${values.controlsHTML}</div>`,
            getBaseScripts(values),
            !this.onlyCoreScript ? getTimeTesterScripts(values) : '',
            getDepsScripts(values),
            '    <div id="wasabyStartScript">',
            `      ${prepareScript(this.startScriptGenerator(values))}`,
            '    </div>',
            !this.onlyCoreScript ? getMaintenanceContainer() : '',
            !this.onlyCoreScript ? getCheckSoftware() : '',
            '  </body>',
            '</html>',
        ];

        return parts.join(newLine);
    }
}
