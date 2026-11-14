import { loadAsync } from 'WasabyLoader/ModulesLoader';
import { addPageDeps } from 'UI/Deps';
import { IRouter } from 'Router/router';
import Main from './rsc/Main.server';

export default function IndexServer() {
    return (
        <Main />
    );
}

export function getDataToRender(url: string, _: unknown, Router: IRouter): Promise<void> | void {
    const pageId = Router.maskResolver.calculateUrlParams('/Router-demo/p/:pageId', url).pageId;
    if (!pageId) {
        return;
    }
    const moduleName = `Router-demo/rsc/${pageId}.server`;
    return loadAsync(moduleName).then(() => {
        addPageDeps([moduleName]);
        return;
    });
}
