import { getStore, logger } from 'Application/Env';
import type { IRenderOptions } from './_Bootstrap/Interface';
import type { IModuleFound } from 'Router/ServerRouting';
import { PartialHtmlGenerator } from './_Bootstrap/html/PartialHtmlGenerator';
import { HtmlGenerator } from './_Bootstrap/html/HtmlGenerator';
import { default as rscStartScript } from './_rsc/startScript';
import { default as rscRenderControls } from './_rsc/renderControls';
import { IPageRenderer, PageRenderer, PartialPageRenderer } from './_Bootstrap/PageRenderer';
import { DataAggregator } from './_Bootstrap/DataAggregator';
import { RscDataAggregator } from './_rsc/RscDataAggregator';
import { PageMainDeps } from './_Bootstrap/DataAggregators/PageMainDeps';

/**
 * Инициализация класса, который будет управлять способом построения html-разметки
 */
export function initPageRenderer(
    isPartialRender: boolean,
    options: IRenderOptions,
    loadedModule: IModuleFound,
    pageId?: string
) {
    const store = getStore<Record<string, IPageRenderer>>('IPageRenderer');
    let instance = store.get('instance');
    if (instance) {
        throw new Error('Попытка повторной инициализации класса построения разметки страницы.');
    }

    // TODO: нужно создание генератора сделать тут полностью
    const controlRenderer = loadedModule.isRSC ? rscRenderControls : undefined;
    const startScriptCreator = loadedModule.isRSC ? rscStartScript : undefined;
    const dataAggregator = loadedModule.isRSC
        ? new RscDataAggregator(pageId)
        : new DataAggregator(pageId).addPre(new PageMainDeps());
    if (isPartialRender) {
        instance = new PartialPageRenderer(
            new PartialHtmlGenerator(loadedModule.isRSC, startScriptCreator),
            controlRenderer,
            options,
            dataAggregator
        );
    } else {
        instance = new PageRenderer(
            new HtmlGenerator(loadedModule.isRSC, startScriptCreator),
            controlRenderer,
            dataAggregator
        );
    }
    store.set('instance', instance);
}

export function getPageRenderer(): IPageRenderer {
    const store = getStore<Record<string, IPageRenderer>>('IPageRenderer');
    let instance = store.get('instance');
    if (!instance) {
        logger.warn('Попытка использовать класс построения разметки страницы без инициализации.');
        instance = new PageRenderer();
        store.set('instance', instance);
    }
    return instance;
}
