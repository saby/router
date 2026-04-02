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
} from './HtmlGenerator';
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
