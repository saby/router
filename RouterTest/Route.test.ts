/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Control, IControlOptions } from 'UI/Base';
import { constants } from 'Env/Env';
import { Route } from 'Router/router';
import { createRouter } from './resources/CreateRouter';
import RouterManager from 'Router/_private/Router/RouterManager';
import * as fakeAppManager from './resources/fakeAppManager';

interface ITestControlOptions extends IControlOptions {
    mask?: string;
}

describe('Router/Route', () => {
    let container: HTMLElement;
    let compat: boolean;
    const Router = createRouter();

    function createControl(options: ITestControlOptions): Control {
        return Control.createControl(
            Route,
            { mask: 'name/:value', Router, ...options },
            container
        );
    }

    before(() => {
        // define a fake ctestapp/Index component so tests
        // do not do redirects
        fakeAppManager.createFakeApp('ctestapp');

        compat = constants.compat;
        constants.compat = false;
    });

    after(() => {
        constants.compat = compat;
    });

    beforeEach(() => {
        Router.url.setStateUrl('/ctestapp');
        Router.history.setHistory([
            {
                id: 0,
                state: '/ctestapp',
                href: '/ctestapp',
            },
        ]);
        Router.history.setHistoryPosition(0);
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });

    test('registers when created', () => {
        const addRouteSpy = jest
            .spyOn(RouterManager.prototype, 'addRoute')
            .mockName('addRoute');
        let control;
        act(() => {
            control = createControl({});
            jest.runAllTimers(); // _afterMount
        });

        expect(addRouteSpy).toBeCalledTimes(1);
        expect(addRouteSpy.mock.calls[0][0]).toEqual(control);
    });

    test('unregisters when destroyed', () => {
        const removeRouteSpy = jest
            .spyOn(RouterManager.prototype, 'removeRoute')
            .mockName('removeRoute');
        let control;
        act(() => {
            control = createControl({});
            jest.runAllTimers(); // _afterMount
        });

        // unmount контрола и вызов _beforeUnmount
        act(() => {
            unmountComponentAtNode(container);
        });

        expect(removeRouteSpy).toBeCalledTimes(1);
        expect(removeRouteSpy.mock.calls[0][0]).toEqual(control);
    });

    test('fires on:enter & on:beforeChange when starts matching url', () => {
        const currentState = { state: '/ctestapp' };
        const newState = { state: '/ctestapp/test/result' };
        let control;
        act(() => {
            control = createControl({ mask: 'test/:value' });
            jest.runAllTimers(); // _afterMount
        });
        const notifySpy = jest.spyOn(control, '_notify');

        act(() => {
            Router.navigate(newState);
        });

        expect(notifySpy).toBeCalled();
        // on:beforeChange
        expect(notifySpy.mock.calls[0][0]).toBe('beforeChange');
        expect(notifySpy.mock.calls[0][1]).toEqual([
            expect.objectContaining(newState),
            expect.objectContaining(currentState),
        ]);
        // on:enter
        expect(notifySpy.mock.calls[1][0]).toBe('enter');
        expect(notifySpy.mock.calls[1][1]).toEqual([
            expect.objectContaining(newState),
            expect.objectContaining(currentState),
        ]);
    });

    test('fires on:enter if it is created when url matches the mask', () => {
        Router.url.setStateUrl('/unique/555-abc-def');

        let control;
        act(() => {
            control = createControl({ mask: 'unique/:uid' });
        });
        const notifySpy = jest.spyOn(control, '_notify');

        act(() => {
            jest.runAllTimers(); // _afterMount
        });

        expect(notifySpy).toBeCalled();
        expect(notifySpy.mock.calls[0][0]).toBe('enter');
    });

    test('fires on:urlChange if it is created when url matches the mask', () => {
        Router.url.setStateUrl('/unique/555-abc-def');

        let control;
        act(() => {
            control = createControl({ mask: 'unique/:uid' });
        });
        const notifySpy = jest.spyOn(control, '_notify');

        act(() => {
            jest.runAllTimers(); // _afterMount
        });

        expect(notifySpy).toBeCalled();
        expect(notifySpy.mock.calls[1][0]).toBe('urlChange');
    });

    test('fires on:leave & on:beforeChange when stops matching url', () => {
        const matchingLocation = { state: '/ctestapp/test/result' };
        const nonMatchingLocation = { state: '/ctestapp' };

        let control;
        act(() => {
            control = createControl({ mask: 'test/:value' });
            jest.runAllTimers(); // _afterMount
        });

        act(() => {
            Router.navigate(matchingLocation);
        });

        const notifySpy = jest.spyOn(control, '_notify');
        act(() => {
            Router.navigate(nonMatchingLocation);
        });

        expect(notifySpy).toBeCalled();
        // on:beforeChange
        expect(notifySpy.mock.calls[0][0]).toBe('beforeChange');
        expect(notifySpy.mock.calls[0][1]).toEqual([
            expect.objectContaining(nonMatchingLocation),
            expect.objectContaining(matchingLocation),
        ]);
        // on:leave
        expect(notifySpy.mock.calls[1][0]).toBe('leave');
        expect(notifySpy.mock.calls[1][1]).toEqual([
            expect.objectContaining(nonMatchingLocation),
            expect.objectContaining(matchingLocation),
        ]);
    });

    test('fires on:urlChange & on:beforeChange when switches between two matched states', () => {
        const currentState = { state: '/ctestapp' };
        const newState = { state: '/ctestapp/two' };

        Router.url.setStateUrl(currentState.state);

        let control;
        act(() => {
            control = createControl({ mask: 'ctestapp/:value' });
            jest.runAllTimers(); // _afterMount
        });
        const notifySpy = jest.spyOn(control, '_notify');

        act(() => {
            Router.navigate(newState);
        });

        act(() => {
            Router.navigate(currentState);
        });

        expect(notifySpy).toBeCalled();
        // on:beforeChange
        expect(notifySpy.mock.calls[0][0]).toBe('beforeChange');
        expect(notifySpy.mock.calls[0][1]).toEqual([
            expect.objectContaining(newState),
            expect.objectContaining(currentState),
        ]);
        // on:urlChange
        expect(notifySpy.mock.calls[1][0]).toBe('urlChange');
        expect(notifySpy.mock.calls[1][1]).toEqual([
            expect.objectContaining({ value: 'two' }),
            expect.objectContaining({ value: '' }),
        ]);
    });

    test('correctly resolves the url parameters', () => {
        let control;
        act(() => {
            control = createControl({ mask: 'myparam=:value' });
            jest.runAllTimers();
        });

        Router.url.setStateUrl('/my/url?myparam=abc&test=true');

        // update
        act(() => {
            control._forceUpdate();
            jest.runAllTimers();
        });

        expect(control._urlOptions.value).toBe('abc');
    });
});
