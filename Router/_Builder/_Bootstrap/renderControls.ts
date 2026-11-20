import * as ControlsHTMLTemplate from 'wml!Router/_Builder/_Bootstrap/ControlsHTML';
import { logger, getStateReceiver } from 'Application/Env';
import { createTitle, createViewPort } from 'UI/Head';
import { IRenderOptions } from './Interface';

/**
 * Этап 1
 * @param moduleName
 * @param options
 */
export function renderControls(
    moduleName: string,
    options: IRenderOptions
): Promise<string | void> {
    createTitle(options.pageConfig ? options.pageConfig.title || '' : '');
    createViewPort();

    /* Нужно последовательно дождаться двух действий:
     * 1 рендер
     * 2 ожидание получения данных из контролов, который захотели вернуть Promise из _beforeMount
     * *
     * Во втором случае контрол не нарисут свою верстку (ограничения React), но получит receivedState на клиенте,
     * если Promise в _beforeMount успеет отработать за 5 секунд
     */
    return new Promise((resolve, reject) => {
        let renderResult;
        try {
            renderResult = ControlsHTMLTemplate(
                {
                    moduleName,
                    options,
                },
                { key: 'bd_' },
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                'throw'
            );
        } catch (error) {
            logger.error('Ошибка при построении html: ', error);

            if ((error as Error).message.indexOf('importScripts failed') > -1) {
                reject(error);
                return;
            }
        }

        void Promise.resolve(renderResult).then((controlsHTML) => {
            // не стоит ждать завершения Promise'ов из _beforeMount'ов асинхронных контролов
            // если есть "нормальный" pageConfig
            if (checkSkipAsync(options)) {
                resolve(controlsHTML);
                return;
            }
            const startSerialization = Date.now();
            void getStateReceiver()
                .waitBeforeMounts()
                .then(() => {
                    logger.info(
                        `waiting beforeMounts is over in ${Date.now() - startSerialization} ms`
                    );
                    resolve(controlsHTML);
                });
        });
    });
}

function checkSkipAsync(options: IRenderOptions) {
    // pageConfig должен быть
    if (!options.pageConfig) {
        return false;
    }
    // этот pageConfig - "нормальный"
    if (
        options.pageConfig.getDataToRender === false &&
        typeof options.pageConfig.error === 'undefined'
    ) {
        return false;
    }

    return true;
}
