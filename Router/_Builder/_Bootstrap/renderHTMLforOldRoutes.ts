import { logger, getStateReceiver } from 'Application/Env';
import { addPageDeps } from 'UI/Deps';
import { renderHTML } from './html/renderHTML';
import { IRenderOptions } from './Interface';
import { aggregateFullData } from './aggregateFullData';

/**
 * Оборачивает <div>...</div> со старыми контролами в HTML
 * Метод вызывается в PresentationService/Service для части страниц из старого роутинга,
 * которые построены через 'wml!UI/Route' - тогда контент будет как <div>...</div>
 */
export function renderHTMLforOldRoutes(
    controlsHTML: string,
    options: IRenderOptions
): Promise<string> {
    if (options.application) {
        // необходимо добавить в зависимости страницы "корневой" модуль
        addPageDeps([options.application]);
    }

    // "такие" страницы в браузере всегда безусловно будет строить UICore/Base:RouteCompatible
    const moduleName = 'UICore/Base:RouteCompatible';

    const startSerialization = Date.now();
    const resulter = () => {
        logger.info(`waiting beforeMounts is over in ${Date.now() - startSerialization} ms`);
        const fullData = aggregateFullData(options, moduleName, controlsHTML);
        return renderHTML({ ...fullData, moduleName });
    };
    return getStateReceiver().waitBeforeMounts().then(resulter, resulter);
}
