/**
 * @jest-environment jsdom
 */
import { render, renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ContextProvider, useLocation } from 'Router/router';
import type { IRouterLocation } from 'Router/router';
// @ts-ignore
import * as defaultRouterJson from 'router';
import UrlRewriterTest from './UrlRewriter/UrlRewriterTest';
import { createRouter } from './resources/CreateRouter';

describe('Router/useLocation', () => {
    const Router = createRouter();

    const wrapper = ({ children }: { children: ReactNode }) => (
        <ContextProvider Router={Router}>{children}</ContextProvider>
    );

    /**
     * Рендерит компонент, который считает свои рендеры и печатает текущий location.
     * Нужен, чтобы проверять именно перерисовку от подписки, а не чтение «живого» window.location.
     */
    function renderLocation() {
        const renderSpy = jest.fn();

        function LocationView() {
            renderSpy();
            const location = useLocation();
            return <span>{`${location.pathname}${location.search}${location.hash}`}</span>;
        }

        const { container } = render(
            <ContextProvider Router={Router}>
                <LocationView />
            </ContextProvider>
        );

        return { renderSpy, container };
    }

    beforeAll(() => {
        UrlRewriterTest._createNewInstance({
            '/ctestapp': 'TestModule/ctestapp',
            '/': 'TestModule',
        });
    });

    afterAll(() => {
        UrlRewriterTest._createNewInstance(
            (defaultRouterJson as unknown as Record<string, string>) || {}
        );
    });

    beforeEach(() => {
        window.history.pushState({}, '', '/ctestapp');
        Router.url.setStateUrl('/ctestapp');
        Router.history.setHistory([
            {
                id: 0,
                state: '/ctestapp',
                href: '/ctestapp',
            },
        ]);
        Router.history.setHistoryPosition(0);
    });

    test('возвращает текущий location', () => {
        const { result } = renderHook(() => useLocation(), { wrapper });

        expect(result.current.pathname).toBe('/ctestapp');
        expect(result.current.search).toBe('');
        expect(result.current.hash).toBe('');
    });

    test('перерисовывает компонент при SPA-переходе', () => {
        const { renderSpy, container } = renderLocation();

        expect(container.textContent).toBe('/ctestapp');
        const callsBefore = renderSpy.mock.calls.length;

        act(() => {
            Router.history.push({ state: '/ctestapp/two', href: '/ctestapp/two' });
        });

        expect(renderSpy.mock.calls.length).toBeGreaterThan(callsBefore);
        expect(container.textContent).toBe('/ctestapp/two');
    });

    test('перерисовывает компонент при replaceState', () => {
        const { renderSpy, container } = renderLocation();

        expect(container.textContent).toBe('/ctestapp');
        const callsBefore = renderSpy.mock.calls.length;

        act(() => {
            Router.history.replaceState({
                state: '/ctestapp/replaced',
                href: '/ctestapp/replaced',
            });
        });

        expect(renderSpy.mock.calls.length).toBeGreaterThan(callsBefore);
        expect(container.textContent).toBe('/ctestapp/replaced');
    });

    test('перерисовывает компонент при переходе назад по истории', () => {
        const { renderSpy, container } = renderLocation();

        act(() => {
            Router.history.push({ state: '/ctestapp/two', href: '/ctestapp/two' });
        });

        expect(container.textContent).toBe('/ctestapp/two');
        const callsBefore = renderSpy.mock.calls.length;

        // адресная строка уже сменилась (как это делает браузер), затем роутер
        // пересчитывает позицию истории и уведомляет подписчиков
        window.history.pushState({}, '', '/ctestapp');
        act(() => {
            Router.history.back();
        });

        expect(renderSpy.mock.calls.length).toBeGreaterThan(callsBefore);
        expect(container.textContent).toBe('/ctestapp');
    });

    test('программный history.back() без смены адреса не меняет location', () => {
        const { renderSpy, container } = renderLocation();

        act(() => {
            Router.history.push({ state: '/ctestapp/two', href: '/ctestapp/two' });
        });

        expect(container.textContent).toBe('/ctestapp/two');
        const callsBefore = renderSpy.mock.calls.length;

        // window.history не трогаем: back() меняет состояние роутера, но не адрес
        act(() => {
            Router.history.back();
        });

        expect(renderSpy.mock.calls.length).toBe(callsBefore);
        expect(container.textContent).toBe('/ctestapp/two');
    });

    test('программный history.forward() без смены адреса не меняет location', () => {
        const { renderSpy, container } = renderLocation();

        expect(container.textContent).toBe('/ctestapp');

        // в истории роутера два состояния, но адресная строка не менялась
        act(() => {
            Router.history.setHistory([
                { id: 0, state: '/ctestapp', href: '/ctestapp' },
                { id: 1, state: '/ctestapp/two', href: '/ctestapp/two' },
            ]);
            Router.history.setHistoryPosition(0);
        });
        const callsBefore = renderSpy.mock.calls.length;

        act(() => {
            Router.history.forward();
        });

        expect(renderSpy.mock.calls.length).toBe(callsBefore);
        expect(container.textContent).toBe('/ctestapp');
    });

    test('мемоизирует location: ссылка меняется только при переходе', () => {
        const locations: IRouterLocation[] = [];

        function View({ n }: { n: number }) {
            locations.push(useLocation());
            return <span>{n}</span>;
        }

        const { rerender } = render(
            <ContextProvider Router={Router}>
                <View n={1} />
            </ContextProvider>
        );

        const initial = locations[locations.length - 1];
        expect(initial.pathname).toBe('/ctestapp');

        // ре-рендер без смены URL — та же ссылка (снимок мемоизирован)
        rerender(
            <ContextProvider Router={Router}>
                <View n={2} />
            </ContextProvider>
        );
        expect(locations[locations.length - 1]).toBe(initial);

        // переход — новая ссылка и новые данные
        act(() => {
            Router.history.push({ state: '/ctestapp/two', href: '/ctestapp/two' });
        });

        const updated = locations[locations.length - 1];
        expect(updated).not.toBe(initial);
        expect(updated.pathname).toBe('/ctestapp/two');
    });

    test('перерисовывает компонент при чисто якорном переходе', async () => {
        const { renderSpy, container } = renderLocation();

        expect(container.textContent).toBe('/ctestapp');
        const callsBefore = renderSpy.mock.calls.length;

        await act(async () => {
            window.location.hash = '#tab';
            // hashchange в jsdom диспатчится отложенной задачей
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(renderSpy.mock.calls.length).toBeGreaterThan(callsBefore);
        expect(container.textContent).toBe('/ctestapp#tab');
    });
});
