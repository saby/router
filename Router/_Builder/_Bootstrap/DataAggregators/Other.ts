import { ICollectedDeps } from 'UI/Deps';
import {
    IDataAggregatorModule,
    IRenderOptions,
    IFullData,
} from 'Router/_Builder/_Bootstrap/Interface';

export class Other implements IDataAggregatorModule {
    execute(options: IRenderOptions, deps: ICollectedDeps): Partial<IFullData> | null {
        return {
            requiredModules: sortRequiredModules(deps.requiredModules),
            isCanceledRevive: options.isCanceledRevive,
            prerender: options.prerender,
        };
    }
}

// todo должны поправить когда-то в будущем
// Из-за того, что между Types/collection и Types/entity и Types/source есть зависимость, но она не прописана статично
// приходится вот такми образом сортировать require-список страницы и эти модули вставлять в начало списка в правильном порядке
function sortRequiredModules(requiredModules?: string[]): string[] | undefined {
    if (!requiredModules) {
        return requiredModules;
    }

    const res = [];
    if (requiredModules.includes('Types/collection')) {
        res.push('Types/collection');
    }
    if (requiredModules.includes('Types/entity')) {
        res.push('Types/entity');
    }
    if (requiredModules.includes('Types/source')) {
        res.push('Types/source');
    }
    return [...new Set([...res, ...requiredModules])];
}
