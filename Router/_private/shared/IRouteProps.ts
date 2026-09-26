import { ReactNode, Ref } from 'react';
import type { TStateChangeFunction } from '../DataInterfaces';

/**
 * Интерфейс прогрессбара.
 * @public
 */
export interface IProgressBar {
    /**
     * Метод, который будет вызван для показа прогрессбара перед загрузкой данных перед SPA переходом
     */
    show: () => void;
    /**
     * Метод, который будет вызван для скрытия прогрессбара после SPA перехода
     */
    hide: () => void;
}

/**
 * Фунция получения данных для рендера.
 */
export type TGetDataToRender = (props: Record<string, unknown>) => Promise<unknown>;

/**
 * Опции компонента Route
 * @public
 */
export interface IRouteProps {
    /**
     * Строка, содержащая специальные placeholder'ы для параметров, начинающиеся с двоеточия.
     * Эти placeholder'ы используются для обозначения определенного параметра в URL-адресе.
     * @remark
     * Значение параметра извлекается из URL и передается внутрь Router.router:Route с именем placeholder'a.
     * При изменении значения параметра в URL-адресе, обновится сам компонент Route, и внутрь него будет передано новое
     * значение параметра.
     *
     * Маски бывают двух видов.
     *
     * Первый - обычная маска с символом `/`, например `paramName/:paramValue`. Она может содержать любое число
     * placeholder'ов, например `tour/:priceMin/:priceMax`.
     * Второй - query-маска с символом `=`, например `paramName=:paramValue`. Она может содержать только один
     * placeholder. Такая маска извлекает значение из "GET-параметров" текущего URL после знака вопроса. Например,
     * для URL-адреса `/mypurchases?filtered=true&paramName=age&greaterthan=2` приведенная выше маска излечет параметр
     * `paramValue` со значением `2`.
     *
     * Более подробно виды масок описаны <a href="https://link.sbis.ru/article/wasaby/eec9bf40-4589-4a40-b841-a4e12fbd3f08#toc_26ad4d13-1927-4939-86ab-4b4679cb1ea2">в статье о роутинге</a>.
     * @example
     * Маска: "paramName/:paramValue"
     *
     * URL: "/paramName/valueOne"        -> paramValue = "valueOne"
     * URL: "/paramName/value/Two"       -> paramValue = "value"
     * URL: "/paramName/value?num=three" -> paramValue = "value"
     * URL: "/paramName/value#Four"      -> paramValue = "value"
     */
    mask: string;

    /**
     * Объект прогрессбар, который будет показан во время загрузки данных перед SPA переходом
     */
    progressBar?: IProgressBar;

    /**
     * Метод загрузки данных для детей при SPA переходе.
     */
    getDataToRender?: TGetDataToRender;

    /**
     * Срабатывает перед каждым изменением url адреса
     */
    onBeforeChange?: TStateChangeFunction;

    /**
     * Срабатывает после перехода, в котором адрес начинает соответствовать маске
     * @example
     * <pre>
     * export function MyComponent(): JSX.Element {
     *     const onEnter = useCallback(() => {
     *         // do smth
     *     }, []);
     *     return <Route mask="search/:query" onEnter={ onEnter } />;
     * }
     * </pre>
     * Текущий адрес: "/home"
     * Переход по адресу: "/page/search/My+query" -> будет вызван onEnter
     */
    onEnter?: TStateChangeFunction;

    /**
     * Срабатывает после перехода, в котором адрес перестает соответствовать маске
     * @example
     * <pre>
     * export function MyComponent(): JSX.Element {
     *     const onLeave = useCallback(() => {
     *         // do smth
     *     }, []);
     *     return <Route mask="search/:query" onLeave={ onLeave } />;
     * </pre>
     * Текущий адрес: "/page/search/My+query"
     * Переход по адресу: "/about" -> будет вызван onLeave
     */
    onLeave?: TStateChangeFunction;

    /**
     * Срабатывает после перехода, в котором значение параметров маски изменилось
     * @example
     * <pre>
     * export function MyComponent(): JSX.Element {
     *     const changeAlert = useCallback((newProps: { alertType?: string }, oldProps: { alertType?: string }) => {
     *         // do smth
     *     }, []);
     *     return <Route mask="alert/:alertType" onUrlChange={ changeAlert } />;
     * }
     * </pre>
     * <pre>
     * Текущий адрес: "/home"
     * Переход по адресу: "/home/alert/signup" -> changeAlert({ alertType: 'signup' }, { alertType: undefined })
     * Переход по адресу: "/home/alert/login"  -> changeAlert({ alertType: 'login' }, { alertType: 'signup' })
     * Переход по адресу: "/home"              -> changeAlert({ alertType: undefined }, { alertType: 'login' })
     * </pre>
     */
    onUrlChange?: (
        newProps: Record<string, string | undefined>,
        oldProps: Record<string, string | undefined>
    ) => void;

    children?: ReactNode | undefined;

    contentWidth?: number | undefined;

    forwardedRef?: Ref<HTMLElement>;
}
