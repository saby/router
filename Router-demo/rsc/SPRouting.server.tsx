/**
 * @author Мустафин Л.И.
 */

import { Route } from 'Router/rsc.server';
import TabsBlock from './TabsBlock.server';

/**
 * Страница демонстрирует SPA-переход между вкладками.
 * Параметр selectedTab извлекается из URL при помощи Router.Route
 * и передаётся в TabsBlock.
 */
export default function SPRouting() {
    return (
        <div>
            <h1>Single Page Routing</h1>
            <p>
                Это пример того, как делать SP переход для переключения между разными вкладками,
                используя <span className="CodeSpan">Router.Route</span> и{' '}
                <span className="CodeSpan">Router.Reference</span>.
            </p>
            <p>
                Блок ниже представляет собой компонент <span className="CodeSpan">TabsBlock</span>,
                которому передается параметр <span className="CodeSpan">selectedTab</span>. Этот
                параметр извлекается из URL-адреса при помощи{' '}
                <span className="CodeSpan">Router.Route</span>, который обернут вокруг блока
                вкладок. Затем переданный параметр используется для отображения текущей выбранной
                вкладки.
            </p>

            {/*
                Параметр selectedTab будет доступен внутри TabsBlock,
                т.к. компонент обернут в Router.Route
            */}
            <Route
                mask="selectedTab/:selectedTab"
                renderChild={(props) => {
                    return <TabsBlock selectedTab={props.selectedTab as string} />;
                }}
            />
        </div>
    );
}
