/**
 * @author Мустафин Л.И.
 */

import { Reference, Route } from 'Router/router';

/**
 * Контент внутри Router.Route: URL-параметры query и fragment передаются сюда как props
 * @private
 */
function MasksContent(props: { queryId?: string; fragmentId?: string }): JSX.Element {
    return (
        <div>
            <p>
                Кликая по списку ниже меняется значение параметра{' '}
                <span className="CodeSpan">{props.queryId ? 'queryId' : 'fragmentId'}</span>. Этот
                параметр извлекается из URL-адреса при помощи{' '}
                <span className="CodeSpan">Router.Route</span>, который обернут вокруг контента.
                Затем переданный параметр используется для отображения содержимого страницы.
            </p>
            {props.queryId ? (
                <>
                    <ul>
                        <li>
                            <Reference state="?query=queryId" queryId="query1">
                                <a>Query 1</a>
                            </Reference>
                        </li>
                        <li>
                            <Reference state="?query=queryId" queryId="query2">
                                <a>Query 2</a>
                            </Reference>
                        </li>
                    </ul>
                    <p>queryId = {props.queryId}</p>
                </>
            ) : (
                <>
                    <ul>
                        <li>
                            <Reference state="#fragment=fragmentId" fragmentId="fragment1">
                                <a>Fragment 1</a>
                            </Reference>
                        </li>
                        <li>
                            <Reference state="#fragment=fragmentId" fragmentId="fragment2">
                                <a>Fragment 2</a>
                            </Reference>
                        </li>
                    </ul>
                    <p>fragmentId = {props.fragmentId}</p>
                </>
            )}
        </div>
    );
}

/**
 * Демонстрация query и fragment параметров в маске
 * @private
 */
export default function Masks(): JSX.Element {
    return (
        <div>
            <h1>Демонстрация query и fragment параметров в маске</h1>

            <p>
                Это пример того, как в <span className="CodeSpan">Router.Route</span> и{' '}
                <span className="CodeSpan">Router.Reference</span> использовать query и fragment
                маски.
            </p>

            <Route mask="?query=:queryId#fragment=fragmentId">
                <MasksContent />
            </Route>
        </div>
    );
}
