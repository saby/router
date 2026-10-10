/**
 * @author Мустафин Л.И.
 */

import { useCallback, useState } from 'react';
import { Route } from 'Router/router';
import type { IHistoryState } from 'Router/router';

/**
 * Заглавная страница демонстрации
 * @private
 */
export default function Intro(): JSX.Element {
    const [preventNavigate, setPreventNavigate] = useState(false);
    const preventNavigateMessage = preventNavigate ? 'SPA переходы заблокированы.' : '';

    const togglePreventNavigate = useCallback(() => {
        setPreventNavigate(!preventNavigate);
    }, [preventNavigate]);

    const onBeforeChange = useCallback(
        (_newLoc: IHistoryState, _oldLoc: IHistoryState): Promise<boolean> => {
            if (preventNavigate) {
                return Promise.resolve(false);
            }
            return Promise.resolve(true);
        },
        [preventNavigate]
    );

    return (
        <div>
            <div>
                <h1>Демо-приложение saby/router</h1>
                <p>
                    Ссылки в верхнем меню изменяют параметр <span className="CodeSpan">pageId</span>{' '}
                    в URL-адресе. В результате чего <span className="CodeSpan">Router.Route</span>{' '}
                    обновляет вложенный <span className="CodeSpan">Router-demo.PageLoader</span>,
                    который изменяет текущую загруженную страницу
                </p>
            </div>
            <div>
                <p>
                    <input
                        type="checkbox"
                        name="preventNavigate"
                        id="preventNavigate"
                        checked={preventNavigate}
                        onChange={togglePreventNavigate}
                    />
                    <label htmlFor="preventNavigate">Запретить смену URL-адреса</label>
                </p>
                <p>{preventNavigateMessage}</p>
                <Route mask="/" onBeforeChange={onBeforeChange}>
                    <div />
                </Route>
            </div>
        </div>
    );
}
