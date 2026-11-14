import { controller } from 'I18n/i18n';
import {
    newLine,
    getBodyAttrs,
    getBaseScripts,
    getTimeTesterScripts,
    getDepsScripts,
    getMaintenanceContainer,
    getCheckSoftware,
} from './htmlParts';
import { IRenderFullData, getStartScriptGenerator, TStartScriptGenerator } from './startScript';
import { prepareScript } from './prepareScript';

export function renderHTML(
    values: IRenderFullData,
    startScriptGenerator: TStartScriptGenerator = getStartScriptGenerator('default')
): string {
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
        `      ${prepareScript(startScriptGenerator(values))}`,
        '    </div>',
        getMaintenanceContainer(),
        getCheckSoftware(),
        '  </body>',
        '</html>',
    ].join(newLine);
}

export class HtmlGenerator {
    private startScriptGenerator: TStartScriptGenerator;

    constructor(
        private isRSC: boolean = false,
        startScriptGenerator?: TStartScriptGenerator
    ) {
        this.startScriptGenerator =
            startScriptGenerator ?? getStartScriptGenerator(this.isRSC ? 'rsc' : 'default');
    }

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
            !this.isRSC ? getTimeTesterScripts(values) : '',
            getDepsScripts(values),
            '    <div id="wasabyStartScript">',
            `      ${prepareScript(this.startScriptGenerator(values))}`,
            '    </div>',
            !this.isRSC ? getMaintenanceContainer() : '',
            !this.isRSC ? getCheckSoftware() : '',
            '  </body>',
            '</html>',
        ];

        return parts.join(newLine);
    }
}
