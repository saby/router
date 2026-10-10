import { getResourceUrl } from 'UI/Utils';
import { IFullData } from '../Interface';

export const newLine = '\n';

export function getBodyAttrs(values: IFullData): string {
    const bodyAttrs: string[] = [];
    if (values.BodyAPIClasses) {
        bodyAttrs.push(`class="${values.BodyAPIClasses}"`);
    }

    if (values.directionality) {
        bodyAttrs.push(`dir="${values.directionality}"`);
    }
    return bodyAttrs.join(' ');
}

export function getBaseScripts(values: IFullData): string {
    if (!values.JSLinksAPIBaseData) {
        return '';
    }

    return [
        '    <div class="wasabyBaseDeps">',
        `      ${values.JSLinksAPIBaseData}`,
        '    </div>',
    ].join(newLine);
}

export function getTimeTesterScripts(values: IFullData): string {
    if (!values.JSLinksAPITimeTesterData) {
        return '';
    }

    return [
        '    <div class="wasabyTimeTester">',
        `      ${values.JSLinksAPITimeTesterData}`,
        '    </div>',
    ].join(newLine);
}

export function getDepsScripts(values: IFullData): string {
    const renderTime = getRenderTimeScript(values);
    if (!values.JSLinksAPIData && !renderTime) {
        return '';
    }

    const result = ['<div class="wasabyJSDeps">'];
    if (values.JSLinksAPIData) {
        result.push(values.JSLinksAPIData);
    }
    if (renderTime) {
        result.push(renderTime);
    }
    result.push('    </div>');
    return result.join(newLine);
}

/**
 * Добавление вычисленного времени рендера верстки на сервере
 */
function getRenderTimeScript(values: IFullData): string {
    if (!values.renderStartTime) {
        return '';
    }
    const ssrTime = Date.now() - values.renderStartTime;
    return `<script>window['ssrTime'] = ${ssrTime};</script>`;
}

export function getCheckSoftware(): string {
    return `<script async src="${getResourceUrl(
        '/cdn/Maintenance/1.0.46/js/checkSoftware.min.js'
    )}" crossorigin="anonymous"></script>`;
}

export function getMaintenanceContainer(): string {
    return '<div id="sbisEnvUI_errorContainer"></div>';
}
