import { logger, query } from 'Application/Env';
import type { IRenderOptions, IPageConfig } from 'Router/Builder';
import { HtmlGenerator } from 'Router/_Builder/_Bootstrap/html/HtmlGenerator';
import { PartialHtmlGenerator } from 'Router/_Builder/_Bootstrap/html/PartialHtmlGenerator';
import { renderControls } from 'Router/_Builder/_Bootstrap/renderControls';
// @ts-ignore
import * as ReactDOMServer from 'react-dom/server';
import { DataAggregator } from './DataAggregator';
import { IFullData } from './Interface';
import { PageModuleName } from './DataAggregators/PageModuleName';
import { WsConfig } from './DataAggregators/WsConfig';
import { Monitoring } from './DataAggregators/Monitoring';
import { LoadingStatus } from './DataAggregators/LoadingStatus';
import { DefaultTags } from './DataAggregators/DefaultTags';
import { BeforeHead } from './DataAggregators/BeforeHead';
import { Head } from './DataAggregators/Head';
import { Body } from './DataAggregators/Body';
import { BaseScripts } from './DataAggregators/BaseScripts';
import { UtilsScripts } from './DataAggregators/UtilsScripts';
import { JS } from './DataAggregators/JS';
import { Other } from './DataAggregators/Other';

type TRenderData = IRenderOptions & {
    application: string;
    pageConfig: IPageConfig;
};

export interface IPageRenderer {
    render(
        moduleName: string,
        renderData: TRenderData,
        callAfterControlsRender?: () => void
    ): Promise<string>;
    renderPartial(): string;
}

/**
 * Класс, который отвечает за генерацию полной html-разметки за один раз
 */
export class PageRenderer implements IPageRenderer {
    constructor(
        private htmlGenerator: HtmlGenerator = new HtmlGenerator(),
        private controlRenderer: typeof renderControls = renderControls,
        private dataAggregator: typeof DataAggregator.prototype = new DataAggregator()
    ) {}

    /**
     * замена метода mainRender - render можно звать много раз подряд
     */
    render(moduleName: string, renderData: TRenderData): Promise<string> {
        if (ReactDOMServer) {
            logger.info('ReactDOMServer loaded');
        }
        return new Promise((pageResolve, reject) => {
            this.controlRenderer(moduleName, renderData)
                .then((controlsHTML: string | void) => {
                    const aggregatedData = this.dataAggregator
                        .addPre(new PageModuleName(moduleName))
                        .add(new WsConfig(renderData))
                        .add(new Monitoring())
                        .add(new LoadingStatus())
                        .add(new DefaultTags())
                        .add(new BeforeHead(renderData.staticDomains))
                        .add(new Head())
                        .add(new Body())
                        .add(new BaseScripts())
                        .add(new UtilsScripts())
                        .add(new JS())
                        .add(new Other())
                        .getData();

                    const fullData = {
                        ...aggregatedData,
                        controlsHTML,
                        renderStartTime: renderData.renderStartTime,
                    } as IFullData;

                    pageResolve(this.htmlGenerator.render({ ...fullData, moduleName }));
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

    constructor(
        private htmlGenerator: PartialHtmlGenerator = new PartialHtmlGenerator(),
        private controlRenderer: typeof renderControls = renderControls,
        private options: IRenderOptions,
        private dataAggregator: typeof DataAggregator.prototype = new DataAggregator()
    ) {}

    /**
     * Формирование готовой части html
     */
    renderPartial(): string {
        let partialData;
        let html;
        if (this.htmlParts.length === 0) {
            logPartialSend('renderPartialHtml', 'Первый render');
            if (ReactDOMServer) {
                logger.info('ReactDOMServer loaded');
            }
            partialData = this.dataAggregator
                .add(new WsConfig(this.options))
                .add(new Monitoring())
                .add(new LoadingStatus())
                .add(new DefaultTags())
                .add(new BeforeHead())
                .add(new Head())
                .add(new BaseScripts())
                .add(new JS(false))
                .getData(false);
            html = this.htmlGenerator.renderStart(partialData);
        } else {
            logPartialSend('renderPartialHtml', 'Последующие render');
            partialData = this.dataAggregator.add(new Head()).add(new JS(false)).getData(false);
            html = this.htmlGenerator.render(partialData);
        }

        logPartialSend('renderPartialHtml', 'Размер готового html: ' + (html ? html.length : 0));
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
        renderData: TRenderData,
        callAfterControlsRender?: () => void
    ): Promise<string> {
        logPartialSend('renderPartialHtml', 'Последний render');
        // если это первая генерация html-разметки при потоковом построении страницы,
        // тогда необходимо сгенерировать полную html-разметку
        if (this.htmlParts.length === 0) {
            logPartialSend(
                'renderPartialHtml',
                'Render страницы целиком - ранее ничего не было отправлено'
            );
            const pr = new PageRenderer(
                new HtmlGenerator(),
                this.controlRenderer,
                this.dataAggregator
            );
            return pr.render(moduleName, renderData);
        }

        logPartialSend('renderPartialHtml', 'Render самой "страницы"');
        return new Promise((pageResolve, reject) => {
            this.controlRenderer(moduleName, renderData)
                .then((controlsHTML: string | void) => {
                    callAfterControlsRender?.();

                    const aggregatedData = this.dataAggregator
                        .addPre(new PageModuleName(moduleName))
                        .add(new Head())
                        .add(new Body())
                        .add(new UtilsScripts())
                        .add(new JS())
                        .add(new Other())
                        .getData();

                    const fullData: IFullData = {
                        ...aggregatedData,
                        controlsHTML: controlsHTML as string | undefined,
                        renderStartTime: renderData.renderStartTime,
                    };

                    const html = this.htmlGenerator.renderEnd({ ...fullData, moduleName });
                    this.htmlParts.push(html);

                    pageResolve(html);
                })
                .catch(reject);
        });
    }
}

/**
 * @private
 */
export function isLoggingPartialSend(): boolean {
    return query.get.logPartialSend === 'true';
}
/**
 * @private
 */
export function logPartialSend(tag: string, message: string) {
    if (!isLoggingPartialSend()) {
        return;
    }

    logger.info(tag, message);
}
