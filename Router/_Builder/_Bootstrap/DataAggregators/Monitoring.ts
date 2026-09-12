import * as AppEnv from 'Application/Env';
import { Head as AppHead } from 'Application/Page';
import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';

/**
 * Скрипты мониторинга
 * @private
 */
export class Monitoring implements IDataAggregatorModule {
    isCanceledRevive?: boolean | undefined = true;

    execute(options: IRenderOptions): Partial<IFullData> | null {
        const HeadAPI = AppHead.getInstance();
        const u = AppEnv.cookie.get('s3su');

        const CSPMonitoringScript = AppEnv.getStore('CSPMonitoringScript') || '';
        // В случае, если в хранилище ничего нет, придет дефолтный IStore, а мы хотим все-же строку
        if (
            u &&
            u.startsWith('00000003') &&
            !!CSPMonitoringScript &&
            typeof CSPMonitoringScript === 'string'
        ) {
            HeadAPI.createMergeTag('script', {}, CSPMonitoringScript);
        }

        const MemoryMonitoringScript = AppEnv.getStore('MemoryMonitoringScript') || '';
        if (
            options.RUMJsHeapMonitoringEnabled &&
            !!MemoryMonitoringScript &&
            typeof MemoryMonitoringScript === 'string'
        ) {
            HeadAPI.createMergeTag('script', {}, MemoryMonitoringScript);
        }

        const errorMonitoringScript = AppEnv.getStore('ErrorMonitoringScript') || '';
        // В случае, если в хранилище ничего нет, придет дефолтный IStore, а мы хотим все-же строку
        if (!!errorMonitoringScript && typeof errorMonitoringScript === 'string') {
            HeadAPI.createMergeTag('script', {}, errorMonitoringScript);
        }

        const CDNMonitoringScript = AppEnv.getStore('CDNMonitoringScript') || '';
        // В случае, если в хранилище ничего нет, придет дефолтный IStore, а мы хотим все-же строку
        if (!!CDNMonitoringScript && typeof CDNMonitoringScript === 'string') {
            HeadAPI.createMergeTag('script', {}, CDNMonitoringScript);
        }

        return null;
    }
}
