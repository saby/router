import { cookie, getStore, query } from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import { ICollectedDeps } from 'UI/Deps';
import { IDataAggregatorModule, IFullData } from 'Router/_Builder/_Bootstrap/Interface';

/**
 * Скрипты мониторинга
 * @private
 */
export class Monitoring implements IDataAggregatorModule {
    readonly addsScripts: boolean = true;

    constructor(private RUMJsHeapMonitoringEnabled?: boolean) {}

    execute(_deps: ICollectedDeps): Partial<IFullData> | null {
        if (query.get.isCanceledRevive === 'noscripts') {
            return null;
        }

        const HeadAPI = AppHead.getInstance();
        const u = cookie.get('s3su');

        const CSPMonitoringScript = getStore('CSPMonitoringScript') || '';
        // В случае, если в хранилище ничего нет, придет дефолтный IStore, а мы хотим все-же строку
        if (
            u &&
            u.startsWith('00000003') &&
            !!CSPMonitoringScript &&
            typeof CSPMonitoringScript === 'string'
        ) {
            HeadAPI.createMergeTag('script', {}, CSPMonitoringScript);
        }

        const MemoryMonitoringScript = getStore('MemoryMonitoringScript') || '';
        if (
            this.RUMJsHeapMonitoringEnabled &&
            !!MemoryMonitoringScript &&
            typeof MemoryMonitoringScript === 'string'
        ) {
            HeadAPI.createMergeTag('script', {}, MemoryMonitoringScript);
        }

        const errorMonitoringScript = getStore('ErrorMonitoringScript') || '';
        // В случае, если в хранилище ничего нет, придет дефолтный IStore, а мы хотим все-же строку
        if (!!errorMonitoringScript && typeof errorMonitoringScript === 'string') {
            HeadAPI.createMergeTag('script', {}, errorMonitoringScript);
        }

        const CDNMonitoringScript = getStore('CDNMonitoringScript') || '';
        // В случае, если в хранилище ничего нет, придет дефолтный IStore, а мы хотим все-же строку
        if (!!CDNMonitoringScript && typeof CDNMonitoringScript === 'string') {
            HeadAPI.createMergeTag('script', {}, CDNMonitoringScript);
        }

        return null;
    }
}
