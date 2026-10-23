import { loadSync } from 'WasabyLoader/ModulesLoader';
import { Reference, Route } from 'Router/rsc.server';
import 'css!Router-demo/Main';
import RootRegExp from './RootRegExp.server';

export default function Main() {
    return (
        <div>
            <Nav />
            <main className="ContentContainer">
                <Route
                    mask="/Router-demo/p/:pageId"
                    renderChild={(props) => {
                        return <RoutePageLoader {...props} />;
                    }}
                />

                <Route
                    mask="/Router-demo/doc/:docId"
                    renderChild={(props) => {
                        return <RouteRootRegExp {...props} />;
                    }}
                />
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
        id: 5,
        state: '/Router-demo/:docId',
        title: 'RegExp In Root',
        props: { docId: '123456' },
    },
];

function Nav(): JSX.Element {
    return (
        <nav className="TopMenu__container">
            <ul className="TopMenu">
                {navItems.map((item) => (
                    <li className="TopMenu__Item" key={item.id}>
                        <Reference
                            state={item.state}
                            {...item.props}
                            className="TopMenu__Link"
                            renderChild={(props) => {
                                return <a {...props}>{item.title}</a>;
                            }}
                        />
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function RoutePageLoader(props: { pageId?: string }) {
    if (!props.pageId) {
        return null;
    }
    const Page = loadSync<React.FunctionComponent>(`Router-demo/rsc/${props.pageId}.server`);
    return <Page />;
}

function RouteRootRegExp(props: { docId?: string }) {
    if (!props.docId) {
        return null;
    }
    return <RootRegExp docId={props.docId} />;
}
