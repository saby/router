import { IPageTagAttrs } from 'Application/Interface';
import { prepareScript } from '../html/prepareScript';

interface IGlobalThis extends Window {
    scriptsCount: Map<string, number>;
    requireList: Map<string, string[]>;
    startScript: Function;
    registerCallback: (order: number, callback: Function) => void;
    readyToStartScript: boolean;
}

interface IScript extends HTMLScriptElement {
    rid: string;
}

/**
 * Создание функции, которая гарантирует последовательный вызов коллбеков в порядке возрастания индекса
 */
function createStrictOrderProcessor() {
    const callbacks = new Map();
    let nextToExecute = 0;
    let isProcessing = false;

    function process() {
        if (isProcessing) return;
        isProcessing = true;

        const executeNext = function () {
            if (!callbacks.has(nextToExecute)) {
                isProcessing = false;
                return;
            }

            const callback = callbacks.get(nextToExecute);
            callbacks.delete(nextToExecute);

            setTimeout(async function () {
                await callback();
                nextToExecute++;
                executeNext();
            }, 0);
        };

        executeNext();
    }

    return function registerCallback(order: number, callback: Function) {
        callbacks.set(order, callback);
        process();
    };
}

/**
 * Реализация функции onload на скриптах, который будет вызван на клиенте при загрузку каждого скрипта
 */
function onloadScript(script: IScript): void {
    // @ts-ignore
    const globalEnv: IGlobalThis = globalThis;
    const rid = script.dataset.rid as string;
    let count = globalEnv.scriptsCount.get(rid);
    if (typeof count === 'undefined') {
        /* eslint-disable-next-line no-console */
        console.error('Ошибка получения количества скриптов. при загрузке файла ' + script.src);
        return;
    }
    count = count - 1;
    globalEnv.scriptsCount.set(rid, count);

    if (count > 0) {
        return;
    }
    const requireList = globalEnv.requireList.get(rid) as string[];
    globalEnv.scriptsCount.delete(rid);
    globalEnv.requireList.delete(rid);
    const requireListFn = () => {
        return new Promise<void>((resolve, reject) => {
            require(requireList, function () {
                resolve();
            }, function (err: Error) {
                /* eslint-disable-next-line no-console */
                console.error(err);
                reject(err);
            });
        });
    };
    if (rid === '1') {
        globalEnv.registerCallback(Number(rid), () => {
            return new Promise((resolve, reject) => {
                require(['Env/Env', 'SbisUI/polyfill'], function (Env: unknown) {
                    // @ts-ignore
                    Object.assign(Env.constants, window.wsConfig);
                    resolve(requireListFn());
                }, function (err: Error) {
                    /* eslint-disable-next-line no-console */
                    console.error(err);
                    reject(err);
                });
            });
        });
    } else {
        globalEnv.registerCallback(Number(rid), requireListFn);
    }
}

export const onloadDescr = `
${prepareScript(createStrictOrderProcessor.toString())}
window.registerCallback = createStrictOrderProcessor();
${prepareScript(onloadScript.toString())}
window.scriptsCount = new Map();
window.requireList = new Map();
window.readyToStartScript = false;
`;

export function initScriptsCount(
    rid: number,
    scriptsCount: number,
    requireList?: string[]
): string {
    let requireModules = (requireList ?? []).join("','");
    if (requireModules) {
        requireModules = `['${requireModules}']`;
    } else {
        requireModules = 'null';
    }
    return `
window.scriptsCount.set('${rid}',${scriptsCount});
window.requireList.set('${rid}',${requireModules || 'null'})
`;
}

/**
 * Добавить обработчик onload на каждый скрипт
 */
export function addOnloadScriptHandler(attrs: IPageTagAttrs): IPageTagAttrs {
    const onload = 'onloadScript(this)';
    if (attrs.onload) {
        attrs.onload = `${attrs.onload};${onload}`;
    } else {
        attrs.onload = onload;
    }
    return attrs;
}

export function startScriptCaller(rid: number): string {
    return `
window.registerCallback(${rid}, () => {
    window.readyToStartScript = true;
    if (window.startScript) {
        window.startScript();
    }
});
`;
}
