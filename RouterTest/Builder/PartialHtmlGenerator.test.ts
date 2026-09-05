import type { IRenderFullData } from 'Router/_Builder/_Bootstrap/html/startScript';
import { PartialHtmlGenerator } from 'Router/_Builder/_Bootstrap/html/PartialHtmlGenerator';

describe('Router/_Builder/_Bootstrap/html/PartialHtmlGenerator', () => {
    test('renderEnd выводит базовые скрипты в head', () => {
        const generator = new PartialHtmlGenerator(true);
        const html = generator.renderEnd({
            HeadAPIData: '<title>Заголовок</title>',
            JSLinksAPIBaseData: '<script src="/base.js"></script>',
            moduleName: 'App',
            controlsHTML: '<div>контент</div>',
        } as IRenderFullData);

        const baseIndex = html.indexOf('<script src="/base.js"></script>');
        expect(baseIndex).toBeGreaterThan(-1);
        expect(baseIndex).toBeLessThan(html.indexOf('</head>'));
    });

    test('renderEnd не выводит базовые скрипты, если их нет', () => {
        const generator = new PartialHtmlGenerator(true);
        const html = generator.renderEnd({
            HeadAPIData: '<title>Заголовок</title>',
            moduleName: 'App',
            controlsHTML: '<div>контент</div>',
        } as IRenderFullData);

        expect(html).not.toContain('wasabyBaseDeps');
        expect(html).not.toContain('undefined');
    });
});
