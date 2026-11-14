/**
 * Простая реализация блока вкладок для демонстрации работы роутинга
 * @private
 */

import { clsx } from 'clsx';
import { Reference } from 'Router/router';
import 'css!Router-demo/resources/TabsBlock';

/**
 * Опции компонента TabsBlock
 * @private
 */
export interface ITabsBlockProps {
    /**
     * Номер выбранной вкладки из URL-адреса
     */
    selectedTab?: string;
}

const TAB_COUNT = 3;

function getValidTabId(selectedTab: string | undefined): number {
    // Убеждаемся, что выбранная вкладка корректна, т.к. URL может быть
    // изменен извне, например вручную пользователем
    if (selectedTab === undefined || selectedTab === '') {
        return 0;
    }
    const parsedTabId = Number.parseInt(selectedTab, 10);
    if (parsedTabId >= 0 && parsedTabId < TAB_COUNT) {
        return parsedTabId;
    }
    return 0;
}

/**
 * Блок вкладок для демонстрации SPA-роутинга.
 * Использует Router.Reference для навигации между вкладками.
 * @private
 */
export default function TabsBlock(props: ITabsBlockProps): JSX.Element {
    const selectedTabId = getValidTabId(props.selectedTab);

    return (
        <div className="TabsBlock">
            <div className="TabsBlock__Tabs">
                <ul>
                    {Array.from({ length: TAB_COUNT }, (_, tabId) => (
                        <li
                            key={tabId}
                            className={clsx(
                                'TabsBlock__Tabs--Item',
                                selectedTabId === tabId && 'TabsBlock__Tabs--ItemActive'
                            )}
                        >
                            <Reference
                                state="selectedTab/:selectedTab"
                                selectedTab={String(tabId)}
                                className="TabsBlock__Tabs--Link"
                            >
                                <a>Tab {tabId}</a>
                            </Reference>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="TabsBlock__Content">
                {selectedTabId === 0 && (
                    <p>
                        Эта вкладка будет открыта по умолчанию или если будет задано некорректное
                        значение в параметре <span className="CodeSpan">selectedTab</span>
                    </p>
                )}
                {selectedTabId === 1 && <p>Это содержимое вкладки "Tab 1".</p>}
                {selectedTabId === 2 && (
                    <p>
                        Это последняя вкладка. Попробуйте нажать кнопки "Назад" и "Вперед" в
                        браузере, чтобы увидеть маршрутизацию одной страницы в действии.
                    </p>
                )}
            </div>
        </div>
    );
}
