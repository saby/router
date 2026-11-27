import { useCallback, useState } from 'react';
import { ContextProvider, Route, createNewRouter } from 'Router/router';
import type { IRouter } from 'Router/router';
import Index from '../Index';
import 'css!Router-demo/resources/AppInPage';

/**
 * Демонстрация работы Router.router:Route для вставки приложения в приложение
 * @private
 */
export default function AppInPage(): JSX.Element {
    const [showRoute, setShowRoute] = useState(false);
    const [newRouter, setNewRouter] = useState<IRouter | undefined>(undefined);

    const toggleRoute = useCallback(() => {
        if (!showRoute) {
            setNewRouter(createNewRouter('/Router-demo'));
        } else {
            setNewRouter(undefined);
        }
        setShowRoute(!showRoute);
    }, [showRoute]);

    return (
        <div>
            <div>
                <h1>Демонстрация работы Router.router:Route для вставки приложения в приложение</h1>
                <p>
                    В имеющейся реализации подразумевается, что прикладной код должен каким-либо
                    образом закрыть доступ к основному приложению, чтобы с ним нельзя было
                    взаимодействовать.
                    <br />
                    В этой демке нет цели сделать полностью рабочее приложение.
                    <br />
                    Цель - показать вставку приложения внутри приложения и демонстрация того, что
                    внутреннее приложение не влияет на состояние основного приложения.
                </p>
            </div>
            <div id="popup-container">
                <button onClick={toggleRoute}>
                    {showRoute ? 'Закрыть' : 'Открыть'} приложение
                </button>
                <br />
                <br />
                {showRoute && newRouter && (
                    <div id="popup-AppInPage">
                        <ContextProvider Router={newRouter}>
                            <Route mask="/Router-demo">
                                <Index Router={newRouter} />
                            </Route>
                        </ContextProvider>
                    </div>
                )}
            </div>
        </div>
    );
}
