/**
 * @author Мустафин Л.И.
 */

import { useCallback } from 'react';
import { Reference, Route } from 'Router/router';
import 'css!Router-demo/Main';
import PageLoader from './resources/PageLoader';
import RootRegExp from './resources/RootRegExp';

/**
 * Точка входа для демонстрации роутинга
 */
export default function Main(): JSX.Element {
    const getDataToRender = useCallback((props: Record<string, unknown>) => {
        return new Promise((resolve) => {
            resolve({ props });
        });
    }, []);
    return (
        <div>
            <Nav />
            <main className="ContentContainer">
                <Route mask="/Router-demo/p/:pageId" getDataToRender={getDataToRender}>
                    <RoutePageLoader />
                </Route>

                <Route mask="/Router-demo/doc/:docId">
                    <RouteRootRegExp />
                </Route>
            </main>
        </div>
    );
}

const navItems = [
    {
        id: 1,
        state: '/Router-demo/p/:pageId',
        title: 'Intro',
        props: { pageId: 'Intro' },
    },
    {
        id: 2,
        state: '/Router-demo/p/:pageId',
        title: 'SP Routing',
        props: { pageId: 'SPRouting' },
    },
    {
        id: 3,
        state: '/Router-demo/p/:pageId?query=:queryId',
        title: 'Query Masks',
        props: { pageId: 'Masks', queryId: 'query' },
    },
    {
        id: 4,
        state: '/Router-demo/p/:pageId#fragment=:fragmentId',
        title: 'Fragment Masks',
        props: { pageId: 'Masks', fragmentId: 'fragment' },
    },
    {
        id: 5,
        state: '/Router-demo/:docId',
        title: 'RegExp In Root',
        props: { docId: '123456' },
    },
    {
        id: 6,
        state: '/Router-demo/p/:pageId',
        title: 'App in page',
        props: { pageId: 'AppInPage' },
    },
];

function Nav(): JSX.Element {
    return (
        <nav className="TopMenu__container">
            <ul className="TopMenu">
                {navItems.map((item) => (
                    <li className="TopMenu__Item" key={item.id}>
                        <Reference state={item.state} {...item.props} className="TopMenu__Link">
                            <a href="#">{item.title}</a>
                        </Reference>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function RoutePageLoader(props: { pageId?: string; pageConfig?: object }) {
    if (!props.pageId) {
        return null;
    }
    return <PageLoader pageId={props.pageId} pageConfig={props.pageConfig} />;
}

function RouteRootRegExp(props: { docId?: string }) {
    if (!props.docId) {
        return null;
    }
    return <RootRegExp docId={props.docId} />;
}
