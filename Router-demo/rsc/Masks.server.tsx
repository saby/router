/**
 * @author Мустафин Л.И.
 *
 * Демонстрация query и fragment параметров в маске.
 * Переписан с WML+TS на TSX (RSC-компонент).
 */

import { Route, Reference } from 'Router/rsc.server';

/**
 * Демонстрация query и fragment параметров в маске.
 * Из URL извлекаются параметры queryId (query-параметр) и fragmentId (fragment-параметр).
 */
export default function Masks() {
    return (
        <div>
            <h1>Демонстрация query и fragment параметров в маске</h1>

            <p>
                Это пример того, как в <span className="CodeSpan">Router.Route</span> и{' '}
                <span className="CodeSpan">Router.Reference</span> использовать query и fragment
                маски.
            </p>

            <Route
                mask="?query=:queryId"
                renderChild={(content) => {
                    return (
                        <div>
                            <p>
                                Кликая по списку ниже меняется значение параметра{' '}
                                <span className="CodeSpan">
                                    {content.queryId ? 'queryId' : 'fragmentId'}
                                </span>
                                . Этот параметр извлекается из URL-адреса при помощи{' '}
                                <span className="CodeSpan">Router.Route</span>, который обернут
                                вокруг контента. Затем переданный параметр используется для
                                отображения содержимого страницы.
                            </p>

                            <ul>
                                <li>
                                    <Reference
                                        state="?query=queryId"
                                        queryId="query1"
                                        renderChild={(props) => <a {...props}>Query 1</a>}
                                    />
                                </li>
                                <li>
                                    <Reference
                                        state="?query=queryId"
                                        queryId="query2"
                                        renderChild={(props) => <a {...props}>Query 2</a>}
                                    />
                                </li>
                            </ul>
                            <p>queryId = {content.queryId}</p>
                        </div>
                    );
                }}
            />
        </div>
    );
}
