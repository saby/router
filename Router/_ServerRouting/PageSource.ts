/**
 *
 * @author Мустафин Л.И.
 */

import { detection } from 'Env/Env';
import { query } from 'Application/Env';
import { mainRender, IRenderOptions, IPageConfig } from 'Router/Builder';
import { TPageSourceData } from './Interfaces/IPageSourceData';
import { PageSourceStatus, TPageSource } from './Interfaces/IPageSource';

/**
 * Класс призван генерировать html-код страницы используя данные, полученные после работы класса PageSourceData
 * @private
 */
export class PageSource {
    /**
     * Формирование итогового ответа с готовым html или с ошибкой
     * @param onSuccessHandler
     * @param onNotFoundHandler
     * @returns
     */
    render(
        options: IRenderOptions,
        renderData: TPageSourceData,
        onSuccessHandler: (html: string) => void,
        onNotFoundHandler: (error: Error) => void
    ): Promise<TPageSource> {
        const pageSource: Promise<TPageSource> = this.renderPageSource(
            options,
            renderData
        );

        return pageSource.then((result: TPageSource) => {
            switch (result.status) {
                case PageSourceStatus.OK:
                    onSuccessHandler(result.html);
                    break;
                case PageSourceStatus.NOT_FOUND:
                default:
                    onNotFoundHandler(result.error);
            }
            return result;
        });
    }

    /**
     * Вызов трехэтапного метода построения верстки используя предзагруженные данные
     * @param options
     * @param renderData
     * @returns Promise<IPageSource>
     */
    private renderPageSource(
        options: IRenderOptions,
        renderData: TPageSourceData
    ): Promise<TPageSource> {
        if (renderData.hasData === false) {
            return Promise.resolve(renderData.notFound);
        }

        return renderData.dataToRender
            .then((pageConfig: IPageConfig) => {
                return mainRender(renderData.moduleName, {
                    application: renderData.moduleName,
                    ...options,
                    ...{
                        pageConfig,
                        isCanceledRevive: !!query.get.isCanceledRevive,
                        prerender: renderData.prerender,
                        sbisCDN: renderData.sbisCDN,
                        sbisEnableHydrate: pageConfig?.sbisEnableHydrate,
                    },
                    ...setSbisIsAdaptive(pageConfig),
                });
            })
            .then((html) => {
                return { status: PageSourceStatus.OK, html };
            });
    }
}

/**
 * Выставление опций адаптивности, если они не выставлены в результате метода getDataToRender.
 * sbisIsAdaptive   служебное поле чтобы проставить значение isAdaptive в контекст на клиенте
 * isAdaptive   признак, что строим в адаптивном режиме - если телефон
 */
function setSbisIsAdaptive(pageConfig: IPageConfig): Partial<IPageConfig> {
    if (!pageConfig || !pageConfig.hasOwnProperty('sbisIsAdaptive')) {
        return {
            sbisIsAdaptive: detection.isPhone,
            isAdaptive: detection.isPhone,
        };
    }

    return {
        sbisIsAdaptive: pageConfig.sbisIsAdaptive,
        isAdaptive: pageConfig.sbisIsAdaptive,
    };
}
