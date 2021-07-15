/// <amd-module name="Router/_ServerRouting/PageSourceData" />
/**
 *
 * @author Мустафин Л.И.
 */

import { headDataStore } from 'UICommon/Deps';
import { MaskResolver } from 'Router/router';
import { TPageSourceData } from './Interfaces/IPageSourceData';
import { IModuleFound, IModuleNotFound } from './Interfaces/IModuleLoader';
import { ModuleLoader } from './ModuleLoader';
import { DataToRender } from './DataToRender';


export interface IServerRoutingRequest {
    path: string;
    compatible: boolean;
    staticConfig: object;
    pageName: string;
}

/**
 * Класс, который загружет модуль, который необходимо построить
 * и потом вызовет метод предзагрузки данных
 */
 export class PageSourceData {
    constructor(private request: IServerRoutingRequest) {
        request.compatible = false;
    }

    /**
     * Загрузить модуль, вызвать метод предзагрузки данных
     * Вернет результат указанного типа
     * @returns
     */
    getResult(): TPageSourceData {
        // Получить название модуля, который в итоге будет строиться, по пути запроса.
        // Так же учитываются маршруты в router.json
        const moduleName = MaskResolver.getAppNameByUrl(this.request.path);

        const loadResult: IModuleNotFound | IModuleFound = new ModuleLoader().load(moduleName);
        if (loadResult.loadStatus === 'not_found') {
            return {
                hasData: false,
                notFound: loadResult.notFound
            };
        }

        // TODO свойство isNewEnvironment будет пересмотрено
        // в https://online.sbis.ru/opendoc.html?guid=c28a34a5-54b2-4873-be99-f452189e64c0
        headDataStore.write('isNewEnvironment', true);

        const dataToRender: Promise<unknown> = new DataToRender().get(loadResult.module, this.request.path, moduleName);
        return {
            hasData: true,
            moduleName,
            dataToRender
        };
    }
}
