/**
 * @author Мустафин Л.И.
 */

import { Route } from 'Router/router';
import TabsBlock from './TabsBlock';

/**
 * Пример SPA-перехода для переключения между вкладками {@link Router-demo/resources/TabsBlock}
 * с использованием {@link Router.Route} и {@link Router.Reference}
 * @private
 */
export default function SPRouting(): JSX.Element {
    return (
        <div>
            <h1>Single Page Routing</h1>
            <p>
                Это пример того, как делать SP переход для переключения между разными вкладками,
                используя <span className="CodeSpan">Router.Route</span> и{' '}
                <span className="CodeSpan">Router.Reference</span>.
            </p>
            <p>
                Блок ниже представляет собой компонент{' '}
                <span className="CodeSpan">Router-demo.resources.TabsBlock</span>, которому
                передается параметр <span className="CodeSpan">selectedTab</span>. Этот параметр
                извлекается из URL-адреса при помощи <span className="CodeSpan">Router.Route</span>,
                который обернут вокруг блока вкладок. Затем переданный параметр используется для
                отображения текущей выбранной вкладки.
            </p>

            {/* Параметр selectedTab будет доступен внутри TabsBlock т.к. компонент обернут в Router.Route */}
            <Route mask="selectedTab/:selectedTab">
                <TabsBlock />
            </Route>
        </div>
    );
}
