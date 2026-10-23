import { IFullData } from '../Interface';
import { getDefaultStartScript } from './_startScript/default';
import { getRscStartScript } from './_startScript/rsc';
import { getStaticPageStartScript } from './_startScript/static';
import { getStatelessStaticPageStartScript } from './_startScript/stateless';
import { getEmptyStartScript } from './_startScript/empty';

/**
 * @private
 */
export interface IRenderFullData extends IFullData {
    moduleName?: string;
    lang?: string;
}

/**
 * Генератор стартового скрипта для конкретного типа построения страницы
 */
export type TStartScriptGenerator = (values: IRenderFullData) => string;

/**
 * Тип построения страницы, определяющий используемый стартовый скрипт
 */
export type TStartScriptMode = 'default' | 'rsc' | 'static' | 'stateless' | 'empty';

const startScriptGenerators: Record<TStartScriptMode, TStartScriptGenerator> = {
    default: (values) => getDefaultStartScript(values.requiredModules),
    rsc: (values) => getRscStartScript(values.requiredModules),
    static: (values) => getStaticPageStartScript(values.builderOptions),
    stateless: (values) =>
        getStatelessStaticPageStartScript(values.builderOptions?.dependencies ?? []),
    empty: () => getEmptyStartScript(),
};

/**
 * Возвращает генератор стартового скрипта для указанного типа построения страницы
 */
export function getStartScriptGenerator(mode: TStartScriptMode): TStartScriptGenerator {
    return startScriptGenerators[mode];
}

/**
 * Оборачивает генератор проверкой отмены оживления страницы (?isCanceledRevive)
 */
export function withCancelRevive(generator: TStartScriptGenerator): TStartScriptGenerator {
    return (values) => (values.isCanceledRevive ? getEmptyStartScript() : generator(values));
}
