import { logger, getStateReceiver } from 'Application/Env';
import { createTitle, createViewPort } from 'UI/Head';
import type { IRenderOptions } from '../_Bootstrap/Interface';
import { renderApp as rscRenderControls } from 'UICore/rsc';

/**
 * Этап 1
 * @param moduleName
 * @param options TODO нужно вывести интерфейс options корректно. IRenderOptions слишком широкий
 *
 */
export default async function renderControls(
    moduleName: string,
    options: IRenderOptions
): Promise<string | void> {
    // #region: TODO нужно вынести из механизм рендера
    createTitle(options.pageConfig ? options.pageConfig.title || '' : '');
    createViewPort();
    // #endregion
    const initialHtml = await rscRenderControls(moduleName, options);

    if (checkSkipAsync(options)) {
        return initialHtml;
    }

    const startSerialization = Date.now();
    return getStateReceiver()
        .waitBeforeMounts()
        .then(() => {
            logger.info(`waiting beforeMounts is over in ${Date.now() - startSerialization} ms`);
            return initialHtml;
        });
}

function checkSkipAsync(options: IRenderOptions) {
    if (!options.pageConfig) {
        return false;
    }
    if (
        options.pageConfig.getDataToRender === false &&
        typeof options.pageConfig.error === 'undefined'
    ) {
        return false;
    }

    return true;
}
