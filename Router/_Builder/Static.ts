import { logger } from 'Application/Env';
import {
    IFullData,
    IRenderOptions,
    IBuilderOptions,
    IBuilderExtraInfo,
} from './_Bootstrap/Interface';
import { renderControls } from './_Bootstrap/renderControls';
import { renderHTML } from './_Bootstrap/html/renderHTML';
import { addPageMainDeps, DataAggregator } from './_Bootstrap/DataAggregator';
import { BaseScripts } from './_Bootstrap/DataAggregators/BaseScripts';
import { Head } from './_Bootstrap/DataAggregators/Head';
import { Body } from './_Bootstrap/DataAggregators/Body';
import { DefaultTags } from './_Bootstrap/DataAggregators/DefaultTags';
import { JS } from './_Bootstrap/DataAggregators/JS';
import { Other } from './_Bootstrap/DataAggregators/Other';
import { WsConfig } from './_Bootstrap/DataAggregators/WsConfig';
import { LoadingStatus } from './_Bootstrap/DataAggregators/LoadingStatus';

/**
 * @private
 */
export interface IRenderBuilderOptions extends IRenderOptions, IBuilderOptions {}

/**
 * Рендер html для статичных страниц, которые генерятся из файлов вида name.html.tmpl в builder
 */
export function renderStatic(options: IRenderBuilderOptions): Promise<string> | string {
    if (options.buildFull) {
        return renderFullStatic(options);
    }
    if (options.buildStateless) {
        return renderStatelessStatic(options);
    }
    return renderSimpleStatic(options);
}

/**
 * Рендер "простой" статичной страницы - страница целиком оживает на клиенте.
 */
function renderSimpleStatic(options: IRenderBuilderOptions): string {
    // специально указываем пустой moduleName, т.к. что строить уже вшито в options.builder
    const moduleName = '';
    const fullData: IFullData = aggregateFullData(options, moduleName);
    // специально обнуляем это поле, оно не нужно для "простой" статичной страницы
    fullData.JSLinksAPIData = '';

    fullData.builderOptions = {
        builder: options.builder,
        builderCompatible: options.builderCompatible,
        dependencies: options.dependencies,
    };
    return renderHTML({ ...fullData, controlsHTML: '<div></div>', moduleName });
}

/**
 * Рендер "stateless" статичной страницы - страница целиком оживает на клиенте и так же wsConfig приходит в GET параметрах.
 */
function renderStatelessStatic(options: IRenderBuilderOptions): string {
    // moduleName приходит из builder в списке зависимостей dependencies
    const moduleName =
        typeof options.dependencies === 'string' ? options.dependencies : options.dependencies[0];
    // необходимо очистить параметры с плейсхолдерами со значениями вида %{WI.SBIS_ROOT}, т.к. некому их подменять при построении
    const _options = {
        ...options,
        wsRoot: '/resources/WS.Core',
        resourceRoot: '/resources/',
        metaRoot: '/resources/',
        defaultServiceUrl: '/service/',
        appRoot: '/',
        RUMEnabled: false,
        pageName: '',
    };
    addPageMainDeps();
    const fullData = new DataAggregator(_options, moduleName)
        .add(new WsConfig())
        .add(new LoadingStatus())
        .add(new DefaultTags())
        .add(new Head())
        .getData() as IFullData;

    fullData.builderOptions = {
        builder: '',
        builderCompatible: false,
        dependencies: options.dependencies,
        buildStateless: options.buildStateless,
    };
    return renderHTML({
        ...fullData,
        controlsHTML: '<div></div>',
        moduleName,
        lang: options.buildStateless?.lang,
    });
}

/**
 * Рендер "полной" статичной страницы - страница полностью построена на стадии билда и только оживает на клиенте.
 */
function renderFullStatic(options: IRenderBuilderOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        requirejs(
            options.dependencies,
            () => {
                const moduleName =
                    options.extraInfo?.topLevelComponentName || options.dependencies[0];

                void renderControls(moduleName, options).then((controlsHTML: string | void) => {
                    const fullData: IFullData = aggregateFullData(
                        options,
                        moduleName,
                        options.extraInfo
                    );

                    resolve(
                        renderHTML({ ...fullData, controlsHTML: controlsHTML || '', moduleName })
                    );
                });
            },
            (err: Error) => {
                logger.error(err);
                reject(err);
            }
        );
    });
}

/**
 * Этап 2 построения полной статичной страницы.
 * Формирование зависимостей, конфигов страницы.
 */
function aggregateFullData(
    options: IRenderOptions,
    moduleName: string,
    extraInfo?: IBuilderExtraInfo
): IFullData {
    const aggregatedData = new DataAggregator(options, moduleName)
        .add(new WsConfig())
        .add(new LoadingStatus())
        .add(new DefaultTags())
        .add(new Head())
        .add(new Body())
        .add(new BaseScripts())
        .add(new JS())
        .add(new Other())
        .getData(extraInfo);

    return aggregatedData as IFullData;
}
