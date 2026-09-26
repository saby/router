import { getStore, logger } from 'Application/Env';
import { IRenderOptions } from './_Bootstrap/Interface';
import { IPageRenderer, PageRenderer, PartialPageRenderer } from './_Bootstrap/PageRenderer';

/**
 * Инициализация класса, который будет управлять способом построения html-разметки
 */
export function initPageRenderer(isPartialRender: boolean, options: IRenderOptions) {
    const store = getStore<Record<string, IPageRenderer>>('IPageRenderer');
    let instance = store.get('instance');
    if (instance) {
        throw new Error('Попытка повторной инициализации класса построения разметки страницы.');
    }
    instance = isPartialRender ? new PartialPageRenderer(options) : new PageRenderer();
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
