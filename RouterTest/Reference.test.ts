/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Control, IControlOptions } from 'UI/Base';
import { constants, detection } from 'Env/Env';
import { Reference } from 'Router/router';
// @ts-ignore
import * as defaultRouterJson from 'router';
import ReferenceTest from 'RouterTest/resources/ReferenceTest';
import fakeLinkContent = require('wml!RouterTest/resources/fakeLinkContent');
import UrlRewriterTest from './UrlRewriter/UrlRewriterTest';
import { createRouter } from './resources/CreateRouter';
import RouterManager from 'Router/_private/Router/RouterManager';

interface ITestControlOptions extends IControlOptions {
    state?: string;
    href?: string;
    content?: Function;
    value?: string;
    tvalue?: string;
    location?: string;
    trailingSlash?: boolean;
}

describe('Router/Reference', () => {
    let container: HTMLElement;
    let compat: boolean;
    const Router = createRouter();

    function createControl(options: ITestControlOptions, _control?): Control {
        return Control.createControl(
            _control || Reference,
            {
                state: 'name/:value',
                value: 'test',
                content: fakeLinkContent,
                Router,
                ...options,
            },
            container
        );
    }

    beforeAll(() => {
        compat = constants.compat;
        constants.compat = false;
        UrlRewriterTest._createNewInstance({
            '/orders': 'SomeModule/page/orders',
        });
    });

    afterAll(() => {
        constants.compat = compat;
        UrlRewriterTest._createNewInstance(
            (defaultRouterJson as unknown as Record<string, string>) || {}
        );
    });

    beforeEach(() => {
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
        const addReferenceSpy = jest
            .spyOn(RouterManager.prototype, 'addReference')
            .mockName('addReference');
        let control;
        act(() => {
            control = createControl({});
            jest.runAllTimers(); // _afterMount
        });

        expect(addReferenceSpy).toBeCalledTimes(1);
        expect(addReferenceSpy.mock.calls[0][0]).toEqual(control);
    });

    test('unregisters when destroyed', () => {
        const removeReferenceSpy = jest
            .spyOn(RouterManager.prototype, 'removeReference')
            .mockName('removeReference');
        let control;
        act(() => {
            control = createControl({});
            jest.runAllTimers(); // _afterMount
        });

        // unmount контрола и вызов _beforeUnmount
        act(() => {
            unmountComponentAtNode(container);
        });

        expect(removeReferenceSpy).toBeCalledTimes(1);
        expect(removeReferenceSpy.mock.calls[0][0]).toEqual(control);
    });

    test('correctly calculates the state', () => {
        Router.url.setStateUrl('/name/value');

        let control;
        act(() => {
            control = createControl({ state: 'test/:tvalue', tvalue: 'true' });
        });

        expect(control._state).toBe('/name/value/test/true');
    });

    test('updates the state when url changes', async () => {
        Router.url.setStateUrl('/name/value');

        let control;
        act(() => {
            control = createControl({ state: 'test/:tvalue', tvalue: 'true' });
            jest.runAllTimers();
        });

        Router.url.setStateUrl('/my/test/false/abc');
        // update
        act(() => {
            control._forceUpdate();
            jest.runAllTimers();
        });

        expect(control._state).toBe('/my/test/true/abc');
    });

    test('correctly calculates the mask-href', () => {
        Router.url.setStateUrl('/random/url/here?test=true');

        let control;
        act(() => {
            control = createControl({
                state: 'url/:location',
                href: '/:location',
                location: 'website',
            });
        });

        expect(control._href).toBe('/website');
    });

    test('correctly calculates the href', () => {
        Router.url.setStateUrl('/orders/certificates');

        let control;
        act(() => {
            control = createControl({ state: '/orders', href: '/orders' });
        });

        expect(control._href).toBe('/orders');
    });

    test('correctly calculates the href with trailing slash in url', () => {
        Router.url.setStateUrl('/orders/certificates/');

        let control;
        act(() => {
            control = createControl({ state: '/orders' });
        });

        expect(control._href).toBe('/orders/');
    });

    test('correctly calculates the href with trailing slash in mask', () => {
        Router.url.setStateUrl('/orders/certificates');

        let control;
        act(() => {
            control = createControl({ state: '/orders/', trailingSlash: true });
        });

        expect(control._href).toBe('/orders/');
    });

    test('updates the href when option changes', () => {
        Router.url.setStateUrl('/random/url/here?test=true');

        const options = {
            state: 'url/:location',
            href: '/:location',
            location: 'website',
        };
        let control;
        act(() => {
            control = createControl(options, ReferenceTest);
            jest.runAllTimers();
        });

        // update
        act(() => {
            control.updateLocation('book');
            jest.runAllTimers();
        });

        expect(control.getChildReference()._href).toBe('/book');
    });

    test('navigates when mousedowned', () => {
        const navigateSpy = jest.spyOn(Router, 'navigate').mockImplementation();

        act(() => {
            createControl({});
            jest.runAllTimers();
        });

        act(() => {
            container
                .querySelector('a')
                .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            jest.runAllTimers();
        });

        expect(navigateSpy).toBeCalledTimes(1);
    });

    test('open link: mousedown with Ctrl key', () => {
        const navigateSpy = jest.spyOn(Router, 'navigate').mockImplementation();
        const clickPreventSpy = jest
            .spyOn(MouseEvent.prototype, 'preventDefault')
            .mockImplementation();

        act(() => {
            createControl({ state: '/path' });
            jest.runAllTimers();
        });

        act(() => {
            const anchor = container.querySelector('a');
            anchor.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true, ctrlKey: true })
            );
            anchor.dispatchEvent(
                new MouseEvent('click', { bubbles: true, ctrlKey: true })
            );
            jest.runAllTimers();
        });

        expect(navigateSpy).not.toBeCalled();
        expect(clickPreventSpy).not.toBeCalled();
    });

    test('open link: mousedown with Cmd key on MacOs', () => {
        jest.spyOn(detection, 'isMacOSDesktop', 'get').mockReturnValue(true);
        const navigateSpy = jest.spyOn(Router, 'navigate').mockImplementation();
        const clickPreventSpy = jest
            .spyOn(MouseEvent.prototype, 'preventDefault')
            .mockImplementation();

        act(() => {
            createControl({ state: '/path' });
            jest.runAllTimers();
        });

        act(() => {
            const anchor = container.querySelector('a');
            anchor.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true, metaKey: true })
            );
            anchor.dispatchEvent(
                new MouseEvent('click', { bubbles: true, metaKey: true })
            );
            jest.runAllTimers();
        });

        expect(navigateSpy).not.toBeCalled();
        expect(clickPreventSpy).not.toBeCalled();
    });

    test('open link: middle btn click', () => {
        const navigateSpy = jest.spyOn(Router, 'navigate').mockImplementation();
        const clickPreventSpy = jest
            .spyOn(MouseEvent.prototype, 'preventDefault')
            .mockImplementation();

        act(() => {
            createControl({ state: '/path' });
            jest.runAllTimers();
        });

        act(() => {
            const anchor = container.querySelector('a');
            anchor.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true, button: 1 })
            );
            anchor.dispatchEvent(
                new MouseEvent('click', { bubbles: true, button: 1 })
            );
            jest.runAllTimers();
        });

        expect(navigateSpy).not.toBeCalled();
        expect(clickPreventSpy).not.toBeCalled();
    });
});
