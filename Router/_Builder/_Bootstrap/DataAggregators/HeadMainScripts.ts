import { registryOnLoadScript, initializationScript } from 'RequireJsLoader/bootstrap';
import { Head as AppHead } from 'Application/Page';
import { createWsConfig } from 'UI/Head';
import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IFullData,
    IRenderOptions,
} from 'Router/_Builder/_Bootstrap/Interface';
import { readyToStartScript } from './startScriptCaller';
import { prepareScript } from '../html/prepareScript';
import getReactMode from '../../getReactMode';

/**
 * Базовый скрипт страницы, который вставляется сразу после стилей и инициализирует wsConfig, require
 * и различные системные обработчики
 * @private
 */
export class HeadMainScripts implements IDataAggregatorModule {
    readonly addsScripts: boolean = true;

    constructor(
        private options: IRenderOptions,
        private isStatelessPage: boolean = false
    ) {}

    execute(): Partial<IFullData> | null {
        // прокинем опцию pagexPackages, чтобы оно попало в wsConfig
        createWsConfig({
            ...this.options,
            reactMode: getReactMode(),
            isStatelessPage: this.isStatelessPage,
        });

        const HeadAPI = AppHead.getInstance();
        const initScript = prepareScript(registryOnLoadScript + initializationScript);
        HeadAPI.createMergeTag('script', {}, initScript);

        HeadAPI.createMergeTag('script', {}, readyToStartScript);

        return null;
    }
}

/**
 * wsConfig и инициализация require для демки require
 */
export class EmptyDemoHeadMainScripts implements IDataAggregatorModule {
    constructor(private options: IRenderOptions) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        createWsConfig(this.options);

        const HeadAPI = AppHead.getInstance();
        const initScript = prepareScript(initializationScript);
        HeadAPI.createMergeTag('script', {}, initScript);

        return null;
    }
}
