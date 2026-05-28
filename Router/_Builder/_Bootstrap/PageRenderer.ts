import { logger } from 'Application/Env';
import { IRenderOptions } from 'Router/Builder';
import { renderHTML } from 'Router/_Builder/_Bootstrap/html/renderHTML';
import { aggregateFullData } from 'Router/_Builder/_Bootstrap/aggregateFullData';
import { PartialHtmlGenerator } from 'Router/_Builder/_Bootstrap/html/PartialHtmlGenerator';
import { renderControls } from 'Router/_Builder/_Bootstrap/renderControls';
// @ts-ignore
import * as ReactDOMServer from 'react-dom/server';
import {
    aggregatePartialData,
    aggregatePartialEndData,
    aggregatePartialStartData,
} from './aggregatePartialData';

export interface IPageRenderer {
    render(
        moduleName: string,
        options: IRenderOptions,
        callAfterControlsRender?: () => void
    ): Promise<string>;
    renderPartial(): string;
}

/**
 * Класс, который отвечает за генерацию полной html-разметки за один раз
 */
export class PageRenderer implements IPageRenderer {
    constructor() {}

    /**
     * замена метода mainRender - render можно звать много раз подряд
     */
    render(moduleName: string, options: IRenderOptions): Promise<string> {
        if (ReactDOMServer) {
            logger.info('ReactDOMServer loaded');
        }
        return new Promise((pageResolve, reject) => {
            renderControls(moduleName, options)
                .then((controlsHTML: string | void) => {
                    const fullData = aggregateFullData(options, moduleName, controlsHTML || '');

                    pageResolve(renderHTML({ ...fullData, moduleName }));
                })
                .catch(reject);
        });
    }

    renderPartial(): string {
        // do nothing
        return '';
    }
}

/**
 * Класс, который отвечает за поэтапную генерацию html-разметки
 */
export class PartialPageRenderer implements IPageRenderer {
    private htmlParts: string[] = [];
    private htmlGenerator: PartialHtmlGenerator;

    constructor(private options: IRenderOptions) {
        this.htmlGenerator = new PartialHtmlGenerator();
    }

    /**
     * Формирование готовой части html
     */
    renderPartial(): string {
        let partialData;
        let html;
        if (this.htmlParts.length === 0) {
            if (ReactDOMServer) {
                logger.info('ReactDOMServer loaded');
            }
            partialData = aggregatePartialStartData(this.options);
            html = this.htmlGenerator.renderStart(partialData);
        } else {
            partialData = aggregatePartialData(this.options);
            html = this.htmlGenerator.render(partialData);
        }

        if (html) {
            this.htmlParts.push(html);
        }
        return html;
    }

    /**
     * Формирование оставшейся части html.
     */
    render(
        moduleName: string,
        options: IRenderOptions,
        callAfterControlsRender?: () => void
    ): Promise<string> {
        // если это первая генерация html-разметки при потоковом построении страницы,
        // тогда необходимо сгенерировать полную html-разметку
        if (this.htmlParts.length === 0) {
            const pr = new PageRenderer();
            return pr.render(moduleName, options);
        }

        return new Promise((pageResolve, reject) => {
            renderControls(moduleName, options)
                .then((controlsHTML: string | void) => {
                    callAfterControlsRender?.();

                    const fullData = aggregatePartialEndData(
                        options,
                        moduleName,
                        controlsHTML || ''
                    );

                    const html = this.htmlGenerator.renderEnd({ ...fullData, moduleName });
                    this.htmlParts.push(html);

                    pageResolve(html);
                })
                .catch(reject);
        });
    }
}
