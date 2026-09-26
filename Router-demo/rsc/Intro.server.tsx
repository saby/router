/**
 * @author Мустафин Л.И.
 */

import { DynamicProxy } from 'Router-demo/client/Dynamic.client';

/**
 * Заглавная страница демонстрации
 * @private
 */
export default function Intro() {
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
            <DynamicProxy />
            {/* <Static/> */}
        </div>
    );
}

function Static() {
    return (
        <div>
            <p>
                <input
                    type="checkbox"
                    name="preventNavigate"
                    id="preventNavigate"
                    checked={false}
                />
                <label htmlFor="preventNavigate">Запретить смену URL-адреса</label>
            </p>
            <p>Функционал запрета переходов не реализован</p>
        </div>
    );
}
