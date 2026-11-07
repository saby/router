/**
 * Простая реализация блока вкладок для демонстрации работы роутинга
 * @private
 */

import { Reference } from 'Router/rsc.server';
import 'css!Router-demo/resources/TabsBlock';

export interface ITabsBlockProps {
    selectedTab?: string;
}

/**
 * Блок вкладок для демонстрации SPA-роутинга.
 * Использует Router.Reference для навигации между вкладками.
 */
export default function TabsBlock(props: ITabsBlockProps) {
    const tabCount = 3;
    const selectedTabId = getValidTabId(props.selectedTab, tabCount);

    return (
        <div className="TabsBlock">
            <div className="TabsBlock__Tabs">
                <ul>
                    {Array.from({ length: tabCount }, (_, i) => (
                        <li
                            key={i}
                            className={
                                'TabsBlock__Tabs--Item' +
                                (selectedTabId === i ? ' TabsBlock__Tabs--ItemActive' : '')
                            }
                        >
                            <Reference
                                state="selectedTab/:selectedTab"
                                selectedTab={String(i)}
                                className="TabsBlock__Tabs--Link"
                                renderChild={(linkProps) => {
                                    return <a {...linkProps}>Tab {i}</a>;
                                }}
                            />
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

function getValidTabId(selectedTab: string | undefined, tabCount: number): number {
    if (selectedTab === undefined || selectedTab === '') {
        return 0;
    }
    const parsed = Number.parseInt(selectedTab, 10);
    if (parsed >= 0 && parsed < tabCount) {
        return parsed;
    }
    return 0;
}
